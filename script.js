var canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 1000;
canvas.style.border= "solid black 5px";
const ctx = canvas.getContext("2d");

//------ESTADO DO JOGO------
var gameState = true; //false=not ok , true=ok
var score = 0;
var scoreTxt = "0";
var scoreOn = true;

var current_obj= new Array(); //Vetor que contém os atuais objetos na cena.
var obst_amount=0; //Na verdade, representa se há (1) ou se não há (0) obstáculos na cena.
var player; //Variável auxiliar que recebe o objeto jogador instanciado.
//--------------------------

//------OBSTACULOS------
var obst_amount = 0;
var obstTop, obstBottom;// obstaculo de cima e obstaculo de baixo
var obst_width = 150; //largura de ambos os obst
var obst_height;//altura do obst de baixo
var gap;//distancia entre os obstaculos

//------DELTA TIME------
var preTime = curTime = dt = fps = 0; //Previous, Current, DT

//------SOUNDS----------
var rightTypeSound = new Audio();
rightTypeSound.src = "RightType.wav";

var wrongTypeSound = new Audio();
wrongTypeSound.src = "WrongType.wav";

var scoreUpSound = new Audio();
scoreUpSound.src = "ScoreUp.wav";
//------------------------

var answer = {
    type: "",
    wordAnswer: "",
    isAnswerSet : true,// verifica se tem resposta disponivel
    textSize: 150,
    x: 50,
    y: 100,

    score_x: 50,
    score_y: 200,
    scoreSize: 100,

    cont: 0, // para motivos de comparação entre a cadeia de caracteres da resposta e da palavra subposta

    word: Array =   [
        "casa",
        "carro",
        "cama",
        "mouse",
        "teclado",
        "gol",
        "porta",
        "copo",
        "lobo",
        "olho",
        "perna",
        "tapete",
        "luz",
        "buraco",
        "vento",
        "piso",
        "jarra",
        "bule",
        "café",
        "morango",
        "tijolo",
        "terra",
        "musgo",
        "areia",
        "fundo",
        "caverna",
        "rosa",
        "mão",
                    ],
    
    randomizeAnswer(){
        var aux = Math.random();
        aux = aux * this.word.length;
        aux = Math.floor(aux);
        this.wordAnswer = this.word[aux];

        this.type = "";
    },

    typing(aux){
        this.type += aux;
    }, 

    //Desenho do texto na tela
    draw(){
        ctx.font = this.textSize + "px Calibri";

        ctx.fillStyle = "rgba(32,32,32, 0.4)";
        ctx.fillText(this.wordAnswer, this.x, this.y);
        
        ctx.fillStyle = "#222";
        ctx.fillText(this.type, this.x, this.y);

        ctx.font = this.scoreSize + "px Calibri";
        ctx.fillText(scoreTxt, this.score_x, this.score_y);
    },

    update(){//Diferentemente dos outros metodos "update", este apenas verifica quando é digitado 
        if(this.type == this.wordAnswer){//Answer == Random Word
            this.cont = 0;
            rightTypeSound.play();
            player.jump();
            this.randomizeAnswer();
        } else if(this.type.charAt(this.cont) != this.wordAnswer.charAt(this.cont)){
            this.cont = 0;
            this.randomizeAnswer();
            wrongTypeSound.load();
            wrongTypeSound.play();
        } else {
            this.cont++;
        } 
    }
}


class Transform{
    x = 0;
    y = 0;
  
    //transladar o objeto
    translate(x,y){
        this.x += x;
        this.y += y;
    }
};

class GameObject extends Transform {
    width = 0;
    height = 0;

    constructor(start_x, start_y, width, height){
        super();

        this.x = start_x;
        this.y = start_y;
        this.width = width;
        this.height = height;

    }

    update(){};
};


class Player extends GameObject{

    gravityAcl = 0; //gravity "acceleration"
    fallSpeed = 1;
    jumpValue = 200;
    color = "#f0f";
    clicked = false;

    gravity(dt){     
        this.translate(0, this.gravityAcl*dt);  
        this.gravityAcl += this.fallSpeed;
    }

    jump(){
        this.gravityAcl = -this.jumpValue;
    }

    collision(obj2_x, obj2_y, obj2_width, obj2_height){
        if((this.x+this.width)>(obj2_x) && (this.x)<(obj2_x+obj2_width) && (this.y+this.height)>(obj2_y) && (this.y)<(obj2_y+obj2_height)){
            gameState=0;
            return true;
        } else {
            return false;
        }
    }

    update(dt){

        //colisao com obstaculos
        if(current_obj.length>1){
        for(var i=1 ; i<=2 ; i++){
            this.collision(current_obj[i].x, current_obj[i].y, current_obj[i].width, current_obj[i].height);

        }
        }
      

        //gravidade
        this.gravity(dt);

        //colisao com a tela
        if(this.y <= 0 || this.y+this.height > canvas.height){
            gameState = false;
        }

        //aumenta o score quando passa o X do obstaculo, se scoreOn tiver setado
        if(current_obj[1] == undefined){
            scoreOn = true;
        }else if(this.x > current_obj[1].x+current_obj[1].width && scoreOn){
            score++;
            scoreTxt = score.toString();
            scoreOn = false;
            scoreUpSound.play();
            }

    }
};

class Obstacle extends GameObject{
    speed=300;
    color = "#2af";

    update(dt){
        this.translate(-this.speed*dt,0);
    }
};


function cleanWindow(){//fills canvas with white color
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}
    
function deltaTime(){
    curTime = Date.now();
    dt = (curTime - preTime)/1000;
    preTime = Date.now();
}

function start(){
    player = new Player(70,10,100,100);
    current_obj.push(player);

    //inicia o texto anteposto
    answer.randomizeAnswer();
    ctx.fillStyle = "rgba(32,32,32, 0.4)";
    ctx.fillText(answer.wordAnswer, answer.x, answer.y);
}


start();
function main(){
    if(gameState){
    
    fps = 1/dt;
                //console.log("fps: " + fps + " dt: " + dt); -------------------------------------------------importante------
    deltaTime();

    //limpa a cena para desenhar o frame seguinte
    cleanWindow();


    /*
    Verifica se há obstaculos no cenario e, caso não houver,
    instancia e adiciona no vetor "current_obj" tanto o obstaculo de cima quanto o de baixo.
    Se não houver obstáculos (quando os obstáculos passam o limite da tela),
    então instancia novamente, tirando os anteriores do vetor e repetindo o processo.
    */
    if(obst_amount==0){
        obst_gapTop = Math.random()*370 + 30; // do topo a 200px abaixo + random entre 0 e 399
        obst_gap = Math.random()*300 + 500;// Distancia entre obstTop e obstBottom
        
        obstTop = new Obstacle(canvas.width+10, 0, obst_width, obst_gapTop);
        obstBottom = new Obstacle(canvas.width+10, obst_gapTop+obst_gap, obst_width, canvas.height);
        current_obj.push(obstTop);
        current_obj.push(obstBottom);

        obst_amount=1;
    }

    if(obstBottom.x < -obst_width) {
        current_obj.pop();
        current_obj.pop();
        obst_amount=0;
    }
    //-------------------------------------------------------------------------------------

    //Para cada objeto no vetor "current_obj", atualiza o comportamento do próprio e o desenha em seguida.
    current_obj.forEach( obj => {
        obj.update(dt);
        ctx.fillStyle = obj.color;
        ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
    });

    //desenha o texto
    answer.draw();

}
}


//Escuta os eventos do teclado
window.addEventListener("keydown", function(e){
    if (e.keyCode >= 65 && e.keyCode <= 90){
    answer.typing(e.key);

    //atualiza resposta
    answer.update();
    }
});

setInterval(main, 0);//frames = 20 = 20 milisegundos = 50 frames por segundo.

