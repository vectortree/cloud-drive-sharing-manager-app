
export function id_generator (data) {
    let id;
    let idFlag = 0;
    for(id=0; id <= data.length; id++){
        for(let i = 0; i < data.length; i++){
            if(id == data[i].id){
                idFlag = 1;
                break;
            }
        }
        if(idFlag == 0){
            break;
        }else{
            idFlag = 0;
        }
    }
    return id;
}