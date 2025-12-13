export default class User{
    constructor(name = null, cash = 0, score = 0, tier = 0){
        this.name = name;
        this.cash = cash;
        this.score = score;
        this.tier = tier;
    }

    getTier(){
        switch(this.tier){
            case 0: return "폰";
            
            case 1: return "나이트";

            case 2: return "비숍";

            case 3: return "룩";

            case 4: return "킹";

            case 5: return "퀸";

            case 6: return "엠페러";
        }
    }

    getName() { return this.name; }

    getCash() { return this.cash; }

    getScore(){ return this.score; }
}