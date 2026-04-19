Add-Type @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Diagnostics;

public class DesktopIconReader
{
    const int LVM_GETITEMCOUNT = 0x1004;
    const int LVM_GETITEMPOSITION = 0x1010;
    const int LVM_GETITEMTEXTW = 0x1073;
    const int LVIF_TEXT = 0x0001;
    const int PROCESS_VM_OPERATION = 0x0008;
    const int PROCESS_VM_READ = 0x0010;
    const int PROCESS_VM_WRITE = 0x0020;
    const int MEM_COMMIT = 0x1000;
    const int MEM_RELEASE = 0x8000;
    const int PAGE_READWRITE = 0x04;

    [StructLayout(LayoutKind.Sequential)]
    struct POINT { public int X; public int Y; }

    [StructLayout(LayoutKind.Sequential)]
    struct LVITEM
    {
        public int mask;
        public int iItem;
        public int iSubItem;
        public int state;
        public int stateMask;
        public IntPtr pszText;
        public int cchTextMax;
        public int iImage;
        public IntPtr lParam;
    }

    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr FindWindow(string lpClassName, string lpWindowName);

    [DllImport("user32.dll", SetLastError = true)]
    static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);

    [DllImport("user32.dll")]
    static extern IntPtr SendMessage(IntPtr hWnd, int Msg, IntPtr wParam, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [DllImport("user32.dll")]
    static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("kernel32.dll")]
    static extern IntPtr OpenProcess(int dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll")]
    static extern IntPtr VirtualAllocEx(IntPtr hProcess, IntPtr lpAddress, int dwSize, int flAllocationType, int flProtect);

    [DllImport("kernel32.dll")]
    static extern bool VirtualFreeEx(IntPtr hProcess, IntPtr lpAddress, int dwSize, int dwFreeType);

    [DllImport("kernel32.dll")]
    static extern bool ReadProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, int dwSize, out int lpNumberOfBytesRead);

    [DllImport("kernel32.dll")]
    static extern bool WriteProcessMemory(IntPtr hProcess, IntPtr lpBaseAddress, byte[] lpBuffer, int nSize, out int lpNumberOfBytesWritten);

    [DllImport("kernel32.dll")]
    static extern bool CloseHandle(IntPtr hObject);

    static IntPtr FindDesktopListView()
    {
        IntPtr progman = FindWindow("Progman", "Program Manager");
        if (progman != IntPtr.Zero)
        {
            IntPtr shellView = FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (shellView != IntPtr.Zero)
            {
                IntPtr lv = FindWindowEx(shellView, IntPtr.Zero, "SysListView32", null);
                if (lv != IntPtr.Zero) return lv;
            }
        }

        IntPtr listView = IntPtr.Zero;
        EnumWindows((hwnd, lParam) =>
        {
            IntPtr shell = FindWindowEx(hwnd, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (shell != IntPtr.Zero)
            {
                listView = FindWindowEx(shell, IntPtr.Zero, "SysListView32", null);
                return false;
            }
            return true;
        }, IntPtr.Zero);

        return listView;
    }

    public static string GetIcons()
    {
        IntPtr listView = FindDesktopListView();
        if (listView == IntPtr.Zero) return "[]";

        int count = (int)SendMessage(listView, LVM_GETITEMCOUNT, IntPtr.Zero, IntPtr.Zero);
        if (count <= 0) return "[]";

        uint processId;
        GetWindowThreadProcessId(listView, out processId);
        IntPtr hProcess = OpenProcess(PROCESS_VM_OPERATION | PROCESS_VM_READ | PROCESS_VM_WRITE, false, processId);
        if (hProcess == IntPtr.Zero) return "[]";

        int lvItemSize = Marshal.SizeOf(typeof(LVITEM));
        int allocSize = lvItemSize + 520;
        IntPtr pRemote = VirtualAllocEx(hProcess, IntPtr.Zero, allocSize, MEM_COMMIT, PAGE_READWRITE);
        if (pRemote == IntPtr.Zero) { CloseHandle(hProcess); return "[]"; }

        var results = new List<string>();
        byte[] pointBuf = new byte[8];
        byte[] textBuf = new byte[520];
        int bytesRead;

        for (int i = 0; i < count; i++)
        {
            // position
            SendMessage(listView, LVM_GETITEMPOSITION, (IntPtr)i, pRemote);
            ReadProcessMemory(hProcess, pRemote, pointBuf, 8, out bytesRead);
            int px = BitConverter.ToInt32(pointBuf, 0);
            int py = BitConverter.ToInt32(pointBuf, 4);

            // text
            IntPtr pText = (IntPtr)(pRemote.ToInt64() + lvItemSize);
            LVITEM item = new LVITEM();
            item.mask = LVIF_TEXT;
            item.iItem = i;
            item.iSubItem = 0;
            item.pszText = pText;
            item.cchTextMax = 260;

            byte[] lvBuf = new byte[lvItemSize];
            GCHandle handle = GCHandle.Alloc(item, GCHandleType.Pinned);
            Marshal.Copy(handle.AddrOfPinnedObject(), lvBuf, 0, lvItemSize);
            handle.Free();

            int written;
            WriteProcessMemory(hProcess, pRemote, lvBuf, lvItemSize, out written);
            SendMessage(listView, LVM_GETITEMTEXTW, (IntPtr)i, pRemote);
            ReadProcessMemory(hProcess, pText, textBuf, 520, out bytesRead);

            string name = Encoding.Unicode.GetString(textBuf);
            int nullIdx = name.IndexOf('\0');
            if (nullIdx >= 0) name = name.Substring(0, nullIdx);
            name = name.Replace("\"", "\\\"").Replace("\\", "\\\\");

            results.Add("{\"name\":\"" + name + "\",\"x\":" + px + ",\"y\":" + py + "}");
        }

        VirtualFreeEx(hProcess, pRemote, 0, MEM_RELEASE);
        CloseHandle(hProcess);

        return "[" + string.Join(",", results.ToArray()) + "]";
    }
}
"@

try {
    $result = [DesktopIconReader]::GetIcons()
    Write-Output $result
} catch {
    Write-Output "[]"
}
