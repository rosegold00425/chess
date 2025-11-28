// shop.ts

type PieceId =
  | "Pawn"
  | "Knight"
  | "Bishop"
  | "Rook"
  | "Queen"
  | "Emperor"
  | "Crusader"
  | "Sentinel"
  | "Berserker"
  | "Assassin"
  | "Phantom";

interface PieceInfo {
  id: PieceId;
  nameKo: string;
  cost: number;
  summary: string;
  movement: string;
}

const PIECES: Record<PieceId, PieceInfo> = {
  Pawn: {
    id: "Pawn",
    nameKo: "폰",
    cost: 100,
    summary: "전진 위주의 기본 보병.",
    movement: "move: 앞 1칸(초기 2칸 등은 변형 규칙에 따라 조정 가능), attack: 대각선 1칸.",
  },
  Knight: {
    id: "Knight",
    nameKo: "나이트",
    cost: 300,
    summary: "기본 L자 이동 기동형 기물.",
    movement: "attack: 가로2+세로1 / 가로1+세로2, 점프 가능.",
  },
  Bishop: {
    id: "Bishop",
    nameKo: "비숍",
    cost: 300,
    summary: "대각선을 장거리로 지배.",
    movement: "attack: 대각선 방향으로 막힐 때까지 이동/공격.",
  },
  Rook: {
    id: "Rook",
    nameKo: "룩",
    cost: 400,
    summary: "직선 압박 담당.",
    movement: "attack: 상하좌우 직선으로 막힐 때까지 이동/공격.",
  },
  Queen: {
    id: "Queen",
    nameKo: "퀸",
    cost: 700,
    summary: "전통 체스 기준 최강 범용 기물.",
    movement: "attack: 룩 + 비숍(직선/대각선 전 방향).",
  },
  Emperor: {
    id: "Emperor",
    nameKo: "엠페러",
    cost: 900,
    summary: "퀸 + 나이트를 합친 변형 최상위 기물.",
    movement: "attack: 퀸의 모든 이동 + 나이트의 L자 이동.",
  },
  Crusader: {
    id: "Crusader",
    nameKo: "크루세이더",
    cost: 600,
    summary: "직선 돌파형 공격 기물.",
    movement:
      "attack: 상하좌우 직선으로 최대 3칸 이동. 이동 경로에서 처음 만난 적 기물을 제거하고 그 칸에서 정지.",
  },
  Sentinel: {
    id: "Sentinel",
    nameKo: "센티넬",
    cost: 500,
    summary: "주변 아군을 보호하는 수비 핵심.",
    movement:
      "move: 8방향 1칸. 특수: 주변 8칸 아군이 제거될 때 1회에 한해 제거를 무효화(센티넬은 그대로 남지만 보호 효과는 사라짐).",
  },
  Berserker: {
    id: "Berserker",
    nameKo: "버서커",
    cost: 450,
    summary: "적을 밀쳐내는 위치 제어 기물.",
    movement:
      "attack: 나이트 이동. 도착 칸 인접한 1기물을 버서커가 이동해 온 방향의 반대 방향으로 1칸 밀침. 밀려난 칸이 보드 밖이면 탈락.",
  },
  Assassin: {
    id: "Assassin",
    nameKo: "어쌔신",
    cost: 350,
    summary: "원거리 암살 전용 기물.",
    movement:
      "move: 상하좌우 1칸. catch: 대각선 2~3칸 떨어진 적 기물을 점프해서 제거(자신은 이동하지 않음).",
  },
  Phantom: {
    id: "Phantom",
    nameKo: "팬텀",
    cost: 300,
    summary: "포지션 선점을 위한 고기동 기물.",
    movement:
      "move: 상하/좌우 직선으로 1~3칸, 점프 가능. 공격 기능 없음.",
  },
};

interface OwnedMap {
  [id: string]: number;
}

class ShopUI {
  private cards: HTMLButtonElement[] = [];
  private descriptionEl: HTMLElement;
  private buyButton: HTMLButtonElement;
  private ownedListEl: HTMLElement;
  private selectedPiece: PieceInfo | null = null;

  private credits: number;
  private creditsDisplay: HTMLSpanElement | null;

  private owned: OwnedMap = {};

  constructor(initialCredits: number = 2000) {
    this.descriptionEl = document.getElementById("shopDescription") as HTMLElement;
    this.buyButton = document.getElementById("btnBuy") as HTMLButtonElement;
    this.ownedListEl = document.getElementById("ownedList") as HTMLElement;

    this.cards = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".shop-card")
    );

    this.credits = initialCredits;
    this.creditsDisplay = document.getElementById(
      "shopCredits"
    ) as HTMLSpanElement | null;

    this.initCards();
    this.initBuyButton();
    this.updateCreditsUI();
  }

  private initCards() {
    this.cards.forEach((card) => {
      card.addEventListener("click", () => {
        const pieceId = card.dataset.piece as PieceId | undefined;
        const cost = Number(card.dataset.cost ?? "0");

        if (!pieceId || !(pieceId in PIECES)) {
          console.warn("Unknown piece:", pieceId);
          return;
        }

        const piece = PIECES[pieceId];

        // 선택 상태 UI
        this.cards.forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");

        this.selectedPiece = piece;
        this.renderDescription(piece, cost);
      });
    });
  }

  private initBuyButton() {
    this.buyButton.addEventListener("click", () => {
      if (!this.selectedPiece) {
        this.flashDescription("기물을 먼저 선택해 주세요.");
        return;
      }
      const piece = this.selectedPiece;
      if (this.credits < piece.cost) {
        this.flashDescription(
          `크레딧이 부족합니다. (필요: ${piece.cost}, 보유: ${this.credits})`
        );
        return;
      }

      this.credits -= piece.cost;
      this.owned[piece.id] = (this.owned[piece.id] ?? 0) + 1;

      this.updateCreditsUI();
      this.renderOwnedList();
      this.flashDescription(`${piece.nameKo}을(를) 구매했습니다.`);
    });
  }

  private renderDescription(piece: PieceInfo, costOverride?: number) {
    const cost = costOverride ?? piece.cost;
    this.descriptionEl.innerHTML = `
      <div><strong>${piece.nameKo}</strong> (${piece.id})</div>
      <div style="margin-top:4px; font-size:0.9rem; color:#cbd5f5;">
        가격: <strong>${cost}</strong>
      </div>
      <div style="margin-top:8px; font-size:0.9rem;">
        ${piece.summary}
      </div>
      <div style="margin-top:8px; font-size:0.85rem; color:#9ca3af; white-space:pre-line;">
        행마법: ${piece.movement}
      </div>
    `;
  }

  private renderOwnedList() {
    this.ownedListEl.innerHTML = "";

    const ids = Object.keys(this.owned) as PieceId[];
    if (ids.length === 0) {
      const empty = document.createElement("div");
      empty.className = "owned-item";
      empty.textContent = "아직 구매한 기물이 없습니다.";
      this.ownedListEl.appendChild(empty);
      return;
    }

    ids
      .sort((a, b) => PIECES[a].cost - PIECES[b].cost)
      .forEach((id) => {
        const count = this.owned[id];
        if (!count) return;
        const piece = PIECES[id];
        const el = document.createElement("div");
        el.className = "owned-item";
        el.textContent = `${piece.nameKo} × ${count}`;
        this.ownedListEl.appendChild(el);
      });
  }

  private updateCreditsUI() {
    if (this.creditsDisplay) {
      this.creditsDisplay.textContent = String(this.credits);
    }
  }

  private flashDescription(msg: string) {
    // 기존 내용은 유지하고, 위/아래에 메시지를 잠시 강조해도 되고
    // 여기서는 그냥 메시지 교체
    this.descriptionEl.innerHTML = `<div style="color:#f97373;">${msg}</div>`;
  }

  // 외부에서 쓰고 싶으면 공개 메서드도 제공
  public getOwnedPieces(): OwnedMap {
    return { ...this.owned };
  }

  public getCredits(): number {
    return this.credits;
  }

  public setCredits(value: number) {
    this.credits = value;
    this.updateCreditsUI();
  }
}

// DOM 준비 후 초기화
window.addEventListener("DOMContentLoaded", () => {
  // 필요하면 여기서 초기 크레딧을 게임 상태에서 받아와서 넣으면 됨
  const shop = new ShopUI(2000);

  // 디버그용으로 window에 붙여두면 콘솔에서 확인 가능
  (window as any).shopUI = shop;
});
