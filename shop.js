// shop.js — compiled from shop.ts (manual transpilation)
const PIECES = {
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
        movement: "attack: 상하좌우 직선으로 최대 3칸 이동. 이동 경로에서 처음 만난 적 기물을 제거하고 그 칸에서 정지.",
    },
    Sentinel: {
        id: "Sentinel",
        nameKo: "센티넬",
        cost: 500,
        summary: "주변 아군을 보호하는 수비 핵심.",
        movement: "move: 8방향 1칸. 특수: 주변 8칸 아군이 제거될 때 1회에 한해 제거를 무효화(센티넬은 그대로 남지만 보호 효과는 사라짐).",
    },
    Berserker: {
        id: "Berserker",
        nameKo: "버서커",
        cost: 450,
        summary: "적을 밀쳐내는 위치 제어 기물.",
        movement: "attack: 나이트 이동. 도착 칸 인접한 1기물을 버서커가 이동해 온 방향의 반대 방향으로 1칸 밀침. 밀려난 칸이 보드 밖이면 탈락.",
    },
    Assassin: {
        id: "Assassin",
        nameKo: "어쌔신",
        cost: 350,
        summary: "원거리 암살 전용 기물.",
        movement: "move: 상하좌우 1칸. catch: 대각선 2~3칸 떨어진 적 기물을 점프해서 제거(자신은 이동하지 않음).",
    },
    Phantom: {
        id: "Phantom",
        nameKo: "팬텀",
        cost: 300,
        summary: "포지션 선점을 위한 고기동 기물.",
        movement: "move: 상하/좌우 직선으로 1~3칸, 점프 가능. 공격 기능 없음.",
    },
};

class ShopUI {
    constructor(initialCredits = 2000) {
        this.cards = [];
        this.descriptionEl = null;
        this.buyButton = null;
        this.ownedListEl = null;
        this.selectedPiece = null;
        this.credits = 0;
        this.owned = {};
        this.descriptionEl = document.getElementById("shopDescription");
        this.buyButton = document.getElementById("btnBuy");
        this.ownedListEl = document.getElementById("ownedList");
        this.creditsDisplay = document.getElementById("displayCrd");
        this.cards = Array.from(document.querySelectorAll(".shop-card"));
        this.credits = initialCredits;
        this.demoAnim = null;
        this.emenyAnim = null;
        this.demoToken = 0;
        this.initCards();
        this.initBuyButton();
        this.updateCreditsUI();
    }
    initCards() {
        this.cards.forEach((card) => {
            card.addEventListener("click", () => {
                const pieceId = card.dataset.piece;
                const cost = Number(card.dataset.cost ?? "0");
                if (!pieceId || !(pieceId in PIECES)) {
                    console.warn("Unknown piece:", pieceId);
                    return;
                }
                const piece = PIECES[pieceId];
                this.cards.forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                this.selectedPiece = piece;
                this.renderDescription(piece, cost);
            });
        });
    }
    initBuyButton() {
        this.buyButton.addEventListener("click", () => {
            if (!this.selectedPiece) {
                this.flashDescription("기물을 먼저 선택해 주세요.");
                return;
            }
            const piece = this.selectedPiece;
            if (this.credits < piece.cost) {
                this.flashDescription(`크레딧이 부족합니다. (필요: ${piece.cost}, 보유: ${this.credits})`);
                return;
            }
            this.credits -= piece.cost;
            this.owned[piece.id] = (this.owned[piece.id] ?? 0) + 1;
            this.updateCreditsUI();
            this.renderOwnedList();
            this.flashDescription(`${piece.nameKo}을(를) 구매했습니다.`);
            
        });
    }
    renderDescription(piece, costOverride) {
        const cost = (costOverride ?? piece.cost);

        this.descriptionEl.innerHTML = `
            <div><strong>${piece.nameKo}</strong> (${piece.id})</div>
            <div style="margin-top:4px; font-size:0.9rem; color:#cbd5f5;">
            가격: <strong>${cost}</strong>
            </div>
            <div style="margin-top:8px; font-size:0.9rem;">
            ${piece.summary}
            </div>
            <div class="movingDisplay" data-piece="${piece.id}"></div>
        `;

        this.renderMovementDemo(piece.id);
    }
    renderOwnedList() {
        this.ownedListEl.innerHTML = "";
        const ids = Object.keys(this.owned);
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
            if (!count)
                return;
            const piece = PIECES[id];
            const el = document.createElement("div");
            el.className = "owned-item";
            el.textContent = `${piece.nameKo} × ${count}`;
            this.ownedListEl.appendChild(el);
        });
    }

    renderMovementDemo(pieceId) {
        const host = this.descriptionEl.querySelector(".movingDisplay");
        if (!host) return;

        // 이전 애니메이션 정리
        if (this.demoAnim) this.demoAnim.cancel();
        if (this.enemyAnim) this.enemyAnim.cancel();

        this.demoToken++;
        const token = this.demoToken;

        const demo = this.getDemo(pieceId);
        host.style.setProperty("--size", String(demo.size));

        // grid + 말 생성
        host.innerHTML = `<div class="mini-grid"></div><div class="demo-piece"></div>`;
        const grid = host.querySelector(".mini-grid");
        const pieceEl = host.querySelector(".demo-piece");

        // 셀 생성
        for (let r = 0; r < demo.size; r++) {
            for (let c = 0; c < demo.size; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.r = String(r);
            cell.dataset.c = String(c);
            grid.appendChild(cell);
            }
        }

        const cellAt = (p) =>
            grid.querySelector(`.cell[data-r="${p[0]}"][data-c="${p[1]}"]`);

        // 타겟 강조
        (demo.targets || []).forEach((p) => {
            const cell = cellAt(p);
            if (cell) cell.classList.add("target");
        });

        // 특수: 밀침/피격 대상 표시용 점(버서커 데모 등)
        let enemyEl = null;
        if (demo.enemy) {
            enemyEl = document.createElement("div");
            enemyEl.className = "demo-enemy";
            host.appendChild(enemyEl);
        }

        // 레이아웃 끝난 뒤 픽셀 계산해서 애니메이션 시작
        requestAnimationFrame(() => {
            if (token !== this.demoToken) return;

            const rect = grid.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return; // 화면이 숨김이면 0일 수 있음

            // grid가 직사각형일 수도 있으니 더 작은 쪽 기준으로 셀 크기 잡기
            const base = Math.min(rect.width, rect.height);
            const cellSize = base / demo.size;
            const radius = 7; // 점 크기(14px)의 반지름

            const toXY = (p) => {
            const x = p[1] * cellSize + cellSize / 2 - radius;
            const y = p[0] * cellSize + cellSize / 2 - radius;
            return { x, y };
            };

            // 말 이동 keyframes 생성
            const keyframes = demo.path.map((p) => {
            const { x, y } = toXY(p);
            return { transform: `translate(${x}px, ${y}px)` };
            });

            // 말 애니메이션
            if (pieceEl && pieceEl.animate) {
            this.demoAnim = pieceEl.animate(keyframes, {
                duration: demo.duration || 1800,
                iterations: Infinity,
                easing: "ease-in-out",
            });
            }

            // 적(밀침) 애니메이션
            if (demo.enemy && enemyEl && enemyEl.animate) {
            const { from, to, at } = demo.enemy;
            const a = toXY(from);
            const b = toXY(to);

            this.enemyAnim = enemyEl.animate(
                [
                { transform: `translate(${a.x}px, ${a.y}px)`, offset: 0 },
                { transform: `translate(${a.x}px, ${a.y}px)`, offset: at }, // 충돌 전 대기
                { transform: `translate(${b.x}px, ${b.y}px)`, offset: Math.min(at + 0.12, 0.98) }, // 밀침
                { transform: `translate(${b.x}px, ${b.y}px)`, offset: 1 },
                ],
                {
                duration: demo.duration || 1800,
                iterations: Infinity,
                easing: "ease-in-out",
                }
            );
            }
        });
    }

    /**
     * 기물별 “대표 이동 예시” 정의(좌표 경로)
     * 좌표는 [row, col], 0~(size-1)
     */
    getDemo(pieceId) {
        switch (pieceId) {
            case "Pawn":
            return {
                size: 5,
                path: [[3, 2], [2, 2], [3, 2], [2, 3], [3, 2]],
                targets: [[2, 2], [2, 3]],
            };

            case "Knight":
            return {
                size: 5,
                path: [[2, 2], [0, 3], [2, 2], [1, 4], [2, 2]],
                targets: [[0, 3], [1, 4]],
            };

            case "Bishop":
            return {
                size: 5,
                path: [[2, 2], [0, 0], [4, 4], [2, 2]],
                targets: [[0, 0], [4, 4]],
            };

            case "Rook":
            return {
                size: 5,
                path: [[2, 2], [2, 4], [4, 4], [4, 0], [2, 2]],
                targets: [[2, 4], [4, 4]],
            };

            case "Queen":
            return {
                size: 5,
                path: [[2, 2], [2, 4], [0, 2], [4, 4], [2, 2]],
                targets: [[2, 4], [0, 2], [4, 4]],
            };

            case "Emperor":
            return {
                size: 5,
                path: [[2, 2], [0, 2], [4, 2], [1, 4], [2, 2]],
                targets: [[0, 2], [1, 4]],
            };

            case "Crusader":
            return {
                size: 5,
                path: [[2, 1], [2, 4], [2, 1]],
                targets: [[2, 4]],
            };

            case "Sentinel":
            return {
                size: 5,
                path: [[2, 2], [2, 3], [3, 3], [3, 2], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [2, 2]],
                targets: [[2, 3], [1, 1]],
                duration: 2200,
            };

            case "Berserker":
            return {
                size: 5,
                path: [[3, 1], [1, 2], [3, 1]],
                targets: [[1, 2]],
                // enemy: from -> to 로 "밀림" (at은 전체 애니메이션 시간 중 몇 %에서 일어나는지)
                enemy: { from: [1, 3], to: [1, 4], at: 0.55 },
                duration: 2000,
            };

            case "Assassin":
            return {
                size: 5,
                path: [[2, 2], [2, 3], [2, 2], [2, 2]],
                targets: [[0, 0]],
                duration: 1900,
            };

            case "Phantom":
            return {
                size: 5,
                path: [[2, 0], [2, 3], [0, 3], [0, 1], [2, 1], [2, 0]],
                targets: [[2, 3], [0, 3]],
                duration: 2200,
            };

            default:
            return { size: 5, path: [[2, 2], [2, 2]] };
        }
    }

    updateCreditsUI() {
        this.creditsDisplay.textContent = String("현재 크레딧: "+this.credits);
    }
    flashDescription(msg) {
        this.descriptionEl.innerHTML = `<div style="color:#f97373;">${msg}</div>`;
    }
    getOwnedPieces() {
        return Object.assign({}, this.owned);
    }
    getCredits() {
        return this.credits;
    }
    setCredits(value) {
        this.credits = value;
        this.updateCreditsUI();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const shop = new ShopUI(2000);
    window.shopUI = shop;
});