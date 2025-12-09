class MainUI{
    constructor(){
        this.startBtn = document.getElementById('btnStartGame');
        this.initStartBtn();
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
}

window.addEventListener("DOMContentLoaded", () => {
    const main = new MainUI();
    window.main = main  ;
});