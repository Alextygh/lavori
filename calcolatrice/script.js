window.onload = function () {
    var schermo = document.getElementById("schermo");

    let Tempeval=0;

    function aggiungi(s){
        schermo.value += s;
    }

    function cancella(){
        schermo.value = "";
    }

    function calcola(){
        try{
            schermo.value = eval(schermo.value);
        } catch(e){
            schermo.value = "errore";
        }
    }

    function radice(){
            if(eval(schermo.value) < 0){
                schermo.value = "errore"
            }else{
                schermo.value = Math.sqrt(eval(schermo.value));
            }
    }

    function sin(){
        schermo.value = Math.sin(eval(schermo.value));
    }

    function cos(){
        schermo.value = Math.cos(eval(schermo.value));
    }

    function tan(){
        schermo.value = Math.cos(eval(schermo.value));
    }

    function memoria(){
        const val = parseFloat(schermo.value);
        if(!isNaN(val)) {
            Tempeval = val;
        }else{
            Tempeval=0;
        }
        
    }

    function memoriastampa(){
        schermo.value = Tempeval;
    }

    window.aggiungi = aggiungi;
    window.cancella = cancella;
    window.calcola = calcola;
    window.radice = radice;
    window.sin = sin;   
    window.cos = cos;    
    window.tan = tan;
    window.memoria = memoria;
    window.memoriastampa = memoriastampa;
}

//zallu
