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

    sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async renderMovementDemo(pieceId) {
        const host = this.descriptionEl.querySelector(".movingDisplay");
        if (!host) return;

        // 새 데모 시작(이전 루프 중단)
        this.demoToken++;
        const token = this.demoToken;

        const demo = this.getDemo(pieceId);
        host.style.setProperty("--size", String(demo.size));

        host.innerHTML = `
            <div class="mini-grid"></div>
            <div class="demo-piece"></div>
            <div class="demo-enemy"></div>
        `;

        const grid = host.querySelector(".mini-grid");
        const pieceEl = host.querySelector(".demo-piece");
        const enemyEl = host.querySelector(".demo-enemy");

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

        const clearCellClasses = () => {
            grid.querySelectorAll(".cell").forEach(el => {
                el.classList.remove("legal", "attack", "move", "capture");
            });
        };

        const rectToXY = (p) => {
            const rect = grid.getBoundingClientRect();
            const cellW = rect.width / demo.size;
            const cellH = rect.height / demo.size;
            const radius = 7; // 14px 점 기준 반지름
            const x = p[1] * cellW + cellW / 2 - radius;
            const y = p[0] * cellH + cellH / 2 - radius;
            return { x, y };
        };

        const placeMarker = (el, p) => {
            const { x, y } = rectToXY(p);
            // capPulse가 transform을 덮을 수 있어서 변수도 같이 저장
            el.style.setProperty("--tx", `${x}px`);
            el.style.setProperty("--ty", `${y}px`);
            el.style.transform = `translate(${x}px, ${y}px)`;
        };

        const animateMarker = (el, from, to, duration = 650) => {
            const a = rectToXY(from);
            const b = rectToXY(to);

            // capPulse가 transform을 애니메이션으로 덮지 않도록 변수 갱신
            el.style.setProperty("--tx", `${b.x}px`);
            el.style.setProperty("--ty", `${b.y}px`);

            const anim = el.animate(
            [
                { transform: `translate(${a.x}px, ${a.y}px)` },
                { transform: `translate(${b.x}px, ${b.y}px)` },
            ],
            { duration, easing: "ease-in-out", fill: "forwards" }
            );
            return anim.finished.catch(() => {});
        };

        // 초기 배치
        requestAnimationFrame(() => {
            if (token !== this.demoToken) return;
            placeMarker(pieceEl, demo.start);
            placeMarker(enemyEl, demo.enemyAt);
        });

        // 반복 루프
        while (token === this.demoToken) {
            clearCellClasses();
            enemyEl.classList.remove("capturable");

            // 1) 이동 가능 칸 표시(1초)
            demo.legal.forEach(({ pos, kind }) => {
                const cell = cellAt(pos);
                if (!cell) return;
                cell.classList.add("legal", kind); // legal + attack/move/capture
            });
            await this.sleep(demo.timing.showMoves);

            if (token !== this.demoToken) break;

            // 2) 이동
            clearCellClasses();
            await animateMarker(pieceEl, demo.start, demo.moveTo, demo.timing.move);

            if (token !== this.demoToken) break;

            // 3) 잡을 수 있는 말 표시(검정→빨강) + 타겟 칸 빨강 테두리
            if (demo.captureAt) {
            cellAt(demo.captureAt)?.classList.add("capture");
            enemyEl.classList.add("capturable");
            }
            await this.sleep(demo.timing.showCapture);

            if (token !== this.demoToken) break;

            // 리셋(다시 시작 위치로)
            enemyEl.classList.remove("capturable");
            clearCellClasses();
            await animateMarker(pieceEl, demo.moveTo, demo.start, demo.timing.reset);
            await this.sleep(120);
        }
    }

    /**
     * 기물별 “대표 이동 예시” 정의(좌표 경로)
     * 좌표는 [row, col], 0~(size-1)
     */
    getDemo(pieceId) {
        const timing = { showMoves: 1500, move: 650, showCapture: 900, reset: 350 };

        if (pieceId === "Pawn") {
            return {
            size: 5,
            start: [3, 2],
            legal: [
                { pos: [2, 2], kind: "move" },
                { pos: [2, 1], kind: "attack" },
                { pos: [2, 3], kind: "attack" },
            ],
            moveTo: [2, 2],
            enemyAt: [1, 1],
            captureAt: [1, 1],
            timing,
            };
        }

        if (pieceId === "Phantom") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [2, 0], kind: "move" },
                { pos: [2, 1], kind: "move" },
                { pos: [2, 3], kind: "move" },
                { pos: [2, 4], kind: "move" },
                { pos: [0, 2], kind: "move" },
                { pos: [1, 2], kind: "move" },
                { pos: [3, 2], kind: "move" },
                { pos: [4, 2], kind: "move" },
            ],
            moveTo: [2, 2],
            enemyAt: [0, 0],
            captureAt: null,
            timing,
            };
        }

        if (pieceId === "Knight") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [0, 1], kind: "attack" },
                { pos: [0, 3], kind: "attack" },
                { pos: [1, 0], kind: "attack" },
                { pos: [1, 4], kind: "attack" },
                { pos: [3, 0], kind: "attack" },
                { pos: [3, 4], kind: "attack" },
                { pos: [4, 1], kind: "attack" },
                { pos: [4, 3], kind: "attack" },
            ],
            moveTo: [0, 3],
            enemyAt: [1, 1],
            captureAt: [1, 1],
            timing,
            };
        }

        if (pieceId === "Bishop") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [0, 0], kind: "attack" },
                { pos: [1, 1], kind: "attack" },
                { pos: [3, 3], kind: "attack" },
                { pos: [4, 4], kind: "attack" },
                { pos: [0, 4], kind: "attack" },
                { pos: [1, 3], kind: "attack" },
                { pos: [3, 1], kind: "attack" },
                { pos: [4, 0], kind: "attack" },
            ],
            moveTo: [1, 1],
            enemyAt: [0, 2],
            captureAt: [0, 2],
            timing,
            };
        }

        if (pieceId === "Assassin") {
            return {
            size: 5,
            start: [3, 2],
            legal: [
                { pos: [3, 1], kind: "move" },
                { pos: [3, 3], kind: "move" },
                { pos: [2, 2], kind: "move" },
                { pos: [4, 2], kind: "move" },
                { pos: [2, 1], kind: "catch" },
                { pos: [1, 0], kind: "catch" },
                { pos: [2, 3], kind: "catch" },
                { pos: [1, 4], kind: "catch" },
                { pos: [4, 1], kind: "catch" },
                { pos: [4, 3], kind: "catch" },
            ],
            moveTo: [3, 1],
            enemyAt: [1, 3],
            captureAt: [1, 3],
            timing,
            };
        }

        if (pieceId === "Rook") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [2, 0], kind: "attack" },
                { pos: [2, 1], kind: "attack" },
                { pos: [2, 3], kind: "attack" },
                { pos: [2, 4], kind: "attack" },
                { pos: [0, 2], kind: "attack" },
                { pos: [1, 2], kind: "attack" },
                { pos: [3, 2], kind: "attack" },
                { pos: [4, 2], kind: "attack" },
            ],
            moveTo: [1, 2],
            enemyAt: [1, 3],
            captureAt: [1, 3],
            timing,
            };
        }

        if (pieceId === "Emperor") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [2, 0], kind: "attack" },
                { pos: [2, 1], kind: "attack" },
                { pos: [2, 3], kind: "attack" },
                { pos: [2, 4], kind: "attack" },
                { pos: [0, 2], kind: "attack" },
                { pos: [1, 2], kind: "attack" },
                { pos: [3, 2], kind: "attack" },
                { pos: [4, 2], kind: "attack" },
                { pos: [0, 0], kind: "attack" },
                { pos: [1, 1], kind: "attack" },
                { pos: [3, 3], kind: "attack" },
                { pos: [4, 4], kind: "attack" },
                { pos: [0, 4], kind: "attack" },
                { pos: [1, 3], kind: "attack" },
                { pos: [3, 1], kind: "attack" },
                { pos: [4, 0], kind: "attack" },
                { pos: [0, 1], kind: "attack" },
                { pos: [0, 3], kind: "attack" },
                { pos: [1, 0], kind: "attack" },
                { pos: [1, 4], kind: "attack" },
                { pos: [3, 0], kind: "attack" },
                { pos: [3, 4], kind: "attack" },
                { pos: [4, 1], kind: "attack" },
                { pos: [4, 3], kind: "attack" },
            ],
            moveTo: [2, 2],
            enemyAt: [0, 3],
            captureAt: [0, 3],
            timing,
            };
        }

        if (pieceId === "Queen") {
            return {
            size: 5,
            start: [2, 2],
            legal: [
                { pos: [2, 0], kind: "attack" },
                { pos: [2, 1], kind: "attack" },
                { pos: [2, 3], kind: "attack" },
                { pos: [2, 4], kind: "attack" },
                { pos: [0, 2], kind: "attack" },
                { pos: [1, 2], kind: "attack" },
                { pos: [3, 2], kind: "attack" },
                { pos: [4, 2], kind: "attack" },
                { pos: [0, 0], kind: "attack" },
                { pos: [1, 1], kind: "attack" },
                { pos: [3, 3], kind: "attack" },
                { pos: [4, 4], kind: "attack" },
                { pos: [0, 4], kind: "attack" },
                { pos: [1, 3], kind: "attack" },
                { pos: [3, 1], kind: "attack" },
                { pos: [4, 0], kind: "attack" },
            ],
            moveTo: [0, 2],
            enemyAt: [0, 3],
            captureAt: [0, 3],
            timing,
            };
        }

        // 기본값
        return {
            size: 5,
            start: [2, 2],
            legal: [
            { pos: [2, 3], kind: "move" },
            { pos: [1, 2], kind: "attack" },
            { pos: [1, 1], kind: "catch" }
            ],
            moveTo: [2, 3],
            enemyAt: [1, 1],
            captureAt: [1, 1],
            timing,
        };
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