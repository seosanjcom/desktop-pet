'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { usePetStore } from "@/stores/pet-store";
import { renderPet } from "@/engine/sprite-renderer";
import { CANVAS_LOGICAL_SIZE } from "@/lib/constants";
import { CHARACTER_INFO, OCCUPATION_INFO, type CharacterType, type UserOccupation } from "@/types/pet";

const CHARACTER_TYPES: CharacterType[] = ['orangutan', 'cat', 'hamster'];
const OCCUPATIONS: UserOccupation[] = ['student', 'office', 'freelancer', 'selfEmployed', 'homemaker', 'jobSeeker', 'other'];

function CharacterOption({ type, selected, onClick }: { type: CharacterType; selected: boolean; onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const info = CHARACTER_INFO[type];

  useEffect(() => {
    let lastTime = 0;
    function loop(now: number) {
      const delta = lastTime ? now - lastTime : 16;
      lastTime = now;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        renderPet(ctx, "happy", "idle", delta, CANVAS_LOGICAL_SIZE, null, false, type);
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [type]);

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: 8,
        borderRadius: 16,
        border: selected ? `3px solid ${info.color}` : '3px solid transparent',
        background: selected ? `${info.color}12` : 'transparent',
        transform: selected ? 'scale(1.08)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_LOGICAL_SIZE}
        height={CANVAS_LOGICAL_SIZE}
        style={{ width: 56, height: 56 }}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? info.color : '#94a3b8' }}>
        {info.name}
      </span>
    </button>
  );
}

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { petName, userName, characterType, userOccupation, changeCharacter, renamePet, renameUser, changeOccupation, resetPet } = usePetStore();
  const [newPetName, setNewPetName] = useState(petName);
  const [newUserName, setNewUserName] = useState(userName);
  const [selectedType, setSelectedType] = useState<CharacterType>(characterType);
  const [selectedOccupation, setSelectedOccupation] = useState<UserOccupation>(userOccupation);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [nameError, setNameError] = useState("");
  const info = CHARACTER_INFO[selectedType];

  const handleSave = useCallback(() => {
    const trimmedPet = newPetName.trim();
    const trimmedUser = newUserName.trim();
    if (trimmedUser.length === 0) {
      setNameError("사용자 이름을 입력해주세요.");
      return;
    }
    if (trimmedPet.length === 0) {
      setNameError("캐릭터 이름을 입력해주세요.");
      return;
    }
    if (trimmedPet.length > 10 || trimmedUser.length > 10) {
      setNameError("이름은 10자 이내로 입력해주세요.");
      return;
    }
    if (trimmedPet !== petName) renamePet(trimmedPet);
    if (trimmedUser !== userName) renameUser(trimmedUser);
    if (selectedType !== characterType) changeCharacter(selectedType);
    if (selectedOccupation !== userOccupation) changeOccupation(selectedOccupation);
    onClose();
  }, [newPetName, newUserName, selectedType, selectedOccupation, petName, userName, characterType, userOccupation, renamePet, renameUser, changeCharacter, changeOccupation, onClose]);

  const handleReset = useCallback(() => {
    resetPet();
    onClose();
  }, [resetPet, onClose]);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(30,41,59,0.85)",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          padding: 24,
          width: "100%",
          maxWidth: 380,
          margin: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>설정</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: "#94a3b8",
              cursor: "pointer",
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* 캐릭터 변경 */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8, display: "block" }}>
            캐릭터 변경
          </label>
          <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
            {CHARACTER_TYPES.map((t) => (
              <CharacterOption
                key={t}
                type={t}
                selected={selectedType === t}
                onClick={() => setSelectedType(t)}
              />
            ))}
          </div>
        </div>

        {/* 사용자 이름 */}
        <div>
          <label
            htmlFor="settings-user-name"
            style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block" }}
          >
            사용자 이름
          </label>
          <input
            id="settings-user-name"
            type="text"
            value={newUserName}
            onChange={(e) => { setNewUserName(e.target.value); setNameError(""); }}
            maxLength={10}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              outline: "none",
              fontSize: 15,
              fontWeight: 600,
              color: "#1e293b",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* 캐릭터 이름 */}
        <div>
          <label
            htmlFor="settings-pet-name"
            style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block" }}
          >
            캐릭터 이름
          </label>
          <input
            id="settings-pet-name"
            type="text"
            value={newPetName}
            onChange={(e) => { setNewPetName(e.target.value); setNameError(""); }}
            maxLength={10}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: 12,
              border: "2px solid #e2e8f0",
              outline: "none",
              fontSize: 15,
              fontWeight: 600,
              color: "#1e293b",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          />
          {nameError && (
            <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center", marginTop: 4 }}>{nameError}</p>
          )}
        </div>

        {/* 직업 변경 */}
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 8, display: "block" }}>
            직업
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {OCCUPATIONS.map((occ) => {
              const occInfo = OCCUPATION_INFO[occ];
              const isSelected = selectedOccupation === occ;
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setSelectedOccupation(occ)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 16,
                    border: isSelected ? '2px solid #f97316' : '2px solid #e2e8f0',
                    background: isSelected ? '#fff7ed' : 'white',
                    color: isSelected ? '#ea580c' : '#64748b',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{occInfo.emoji}</span>
                  <span>{occInfo.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 14,
            border: "none",
            background: info.color,
            color: "white",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          저장하기
        </button>

        {/* 리셋 */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "transparent",
                color: "#ef4444",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              처음부터 다시 시작
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
              <p style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                정말 리셋하시겠어요? 모든 데이터가 삭제됩니다.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    color: "#64748b",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    border: "none",
                    background: "#ef4444",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  리셋
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
