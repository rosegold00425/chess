export default class MainUI{
    constructor(){
        this.startBtn = document.getElementById('btnStartGame');
        this.user = null;
        this.initStartBtn();
        this.updateUserData();
    }

    initStartBtn(){
        this.startBtn.addEventListener("click", () => {
            if(this.startBtn.classList.contains('searching')){
                this.startBtn.classList.remove('searching');
                this.startBtn.textContent = '게임 시작';
                this.searchPlayer(true);
            }else{
                this.startBtn.textContent = '매칭 중...';
                this.startBtn.classList.add('searching');
                this.searchPlayer(false);
            }
        });

        this.startBtn.addEventListener("mouseover", () => {
            if(!this.startBtn.classList.contains('searching')) return;
            this.startBtn.textContent = '매칭 취소'
        });

        this.startBtn.addEventListener("mouseleave", () => {
            if(!this.startBtn.classList.contains('searching')) return;
            this.startBtn.textContent = '매칭 중...'
        });
    }

    searchPlayer(){
        
    }

    updateUserData(){
        if(this.user == null) return;

        const nameDisplay = document.getElementById('playerNick');
        const scoreDisplay = document.getElementById('playerScore');
        const tierDisplay = document.getElementById('playerTier');
        const currencyDisplay = document.getElementById('playerCurrency');

        nameDisplay.textContent = this.user.getName();
        scoreDisplay.textContent = this.user.getScore();
        tierDisplay.textContent = this.user.getTier();
        currencyDisplay.textContent = this.user.getCash();
    }

    setUser(user){ this.user = user; }
}

window.addEventListener("DOMContentLoaded", () => {
    const main = new MainUI();
    window.main = main  ;
});