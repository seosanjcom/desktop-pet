'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { usePetStore } from "@/stores/pet-store";
import { renderPet } from "@/engine/sprite-renderer";
import { CANVAS_LOGICAL_SIZE } from "@/lib/constants";
import { CHARACTER_INFO, OCCUPATION_INFO, type CharacterType, type UserOccupation } from "@/types/pet";

const CHARACTER_TYPES: CharacterType[] = ['orangutan', 'cat', 'penguin', 'hamster'];
const OCCUPATIONS: UserOccupation[] = ['student', 'office', 'freelancer', 'selfEmployed', 'homemaker', 'jobSeeker', 'other'];

function CharacterPreview({ type, selected, onClick }: { type: CharacterType; selected: boolean; onClick: () => void }) {
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
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_LOGICAL_SIZE}
        height={CANVAS_LOGICAL_SIZE}
        style={{ width: 64, height: 64 }}
        aria-label={`${info.name} 미리보기`}
      />
      <span style={{ fontSize: 11, fontWeight: 700, color: selected ? info.color : '#94a3b8' }}>
        {info.name}
      </span>
      <span style={{ fontSize: 10, color: '#94a3b8' }}>{info.description}</span>
    </button>
  );
}

function OccupationChip({ occupation, selected, onClick }: { occupation: UserOccupation; selected: boolean; onClick: () => void }) {
  const info = OCCUPATION_INFO[occupation];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 20,
        border: selected ? '2px solid #f97316' : '2px solid #e2e8f0',
        background: selected ? '#fff7ed' : 'white',
        color: selected ? '#ea580c' : '#64748b',
        fontWeight: selected ? 700 : 500,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </button>
  );
}

export function OnboardingModal() {
  const [step, setStep] = useState<1 | 2>(1);
  const [petName, setPetName] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<CharacterType>("orangutan");
  const [selectedOccupation, setSelectedOccupation] = useState<UserOccupation>("office");
  const createPet = usePetStore((s) => s.createPet);
  const info = CHARACTER_INFO[selectedType];

  const handleNext = useCallback(() => {
    const trimmedUser = userName.trim();
    if (trimmedUser.length === 0) {
      setError("사용자 이름을 입력해주세요.");
      return;
    }
    if (trimmedUser.length > 10) {
      setError("이름은 10자 이내로 입력해주세요.");
      return;
    }
    setError("");
    setStep(2);
  }, [userName]);

  const handleSubmit = useCallback(() => {
    const finalPetName = petName.trim() || info.name;
    createPet(finalPetName, userName.trim(), selectedType, selectedOccupation);
  }, [petName, userName, createPet, selectedType, selectedOccupation, info.name]);

  return (
    <div
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
          maxWidth: 440,
          margin: "0 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {step === 1 ? (
          <>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                친구를 골라주세요!
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                함께할 친구를 선택하고 이름을 지어주세요
              </p>
            </div>

            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              {CHARACTER_TYPES.map((t) => (
                <CharacterPreview
                  key={t}
                  type={t}
                  selected={selectedType === t}
                  onClick={() => setSelectedType(t)}
                />
              ))}
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  htmlFor="user-name"
                  style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}
                >
                  당신의 이름
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); setError(""); }}
                  placeholder="이름을 입력해주세요"
                  maxLength={10}
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "2px solid #e2e8f0",
                    outline: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e293b",
                    textAlign: "center",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label
                  htmlFor="pet-name"
                  style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}
                >
                  캐릭터 이름 (비우면 기본 이름)
                </label>
                <input
                  id="pet-name"
                  type="text"
                  value={petName}
                  onChange={(e) => { setPetName(e.target.value); }}
                  placeholder={info.name}
                  maxLength={10}
                  onKeyDown={(e) => { if (e.key === "Enter") handleNext(); }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "2px solid #e2e8f0",
                    outline: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#1e293b",
                    textAlign: "center",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              {error && (
                <p style={{ color: "#ef4444", fontSize: 12, textAlign: "center" }}>{error}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                border: "none",
                background: info.color,
                color: "white",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              다음
            </button>

            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
              배고파하고, 심심해하고, 피곤해해요. 잘 돌봐주세요!
            </p>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                당신에 대해 알려주세요
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                맞춤 대화를 위해 직업을 선택해주세요
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                justifyContent: "center",
                padding: "4px 0",
              }}
            >
              {OCCUPATIONS.map((occ) => (
                <OccupationChip
                  key={occ}
                  occupation={occ}
                  selected={selectedOccupation === occ}
                  onClick={() => setSelectedOccupation(occ)}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "14px 0",
                  borderRadius: 14,
                  border: "2px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                이전
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                style={{
                  flex: 2,
                  padding: "14px 0",
                  borderRadius: 14,
                  border: "none",
                  background: info.color,
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                시작하기!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
