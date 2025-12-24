

function normalizeResults(payload) {
    if (payload && typeof payload.results === "string") {
        payload.results = JSON.parse(payload.results);
    }
    return payload;
}

function removeElementsByClass(className) {
    let elements = document.getElementsByClassName(className);
    while(elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function new_section(i, name, type, caffeine, ingredients, brand, amount, steep_time) {
    let brand_cleaned = ''
    let caffeine_output = 'Not Caffeinated'
    if(caffeine=== true){
       caffeine_output = 'Caffeinated'
    }
    else {
        caffeine_output = 'not Caffeinated'
    }

    let newDiv = document.createElement("card");
    newDiv.id = i;
    newDiv.className = "card";

    value = '<hr>' +

        '<h1>' + name + '</h1>'+
        ' <p style=" font-style: italic;" >' + brand +'</p>' +
        '<h2>' + type + '</h2>' +'<p>' + caffeine_output+ '</p>' +
        ' <p> Ingredients: ' + ingredients +'</p>' +
        ' <p> Amount: ' + amount +' Grams </p>' +
        ' <p> Steep time: ' + steep_time + ' minutes' + '</p>'
    ;

    newDiv.innerHTML = value ;
    let currentDiv = document.getElementById("main");
    document.body.insertBefore(newDiv, currentDiv);


}

function intersectByName(arr1, arr2) {
    // If Search didn't return an array, bail safely
    if (!Array.isArray(arr1)) return [];

    // Case 1: arr2 is an array of objects with Name -> true intersection
    if (Array.isArray(arr2)) {
        const namesInArr2 = new Set(arr2.map(item => item?.Name).filter(Boolean));
        return arr1.filter(item => namesInArr2.has(item?.Name));
    }

    // Case 2: arr2 is a boolean or an object like { caffeine: true/false }
    // -> interpret as "filter arr1 by caffeine flag"
    const caffeineFlag =
        (typeof arr2 === "boolean") ? arr2 :
            (arr2 && typeof arr2 === "object" && typeof arr2.caffeine === "boolean") ? arr2.caffeine :
                null;

    if (caffeineFlag === null) return [];

    return arr1.filter(item => item?.caffeine === caffeineFlag);
}



async function get_caffeine(state) {
    console.log(state);
    const request = await fetch ("http://localhost:8000/caffeine/" + state);



    return normalizeResults(await request.json());



}

async function Search(param, value, state) {
    const response = await fetch(
        `http://localhost:8000/search/${encodeURIComponent(param)}?term=${encodeURIComponent(value)}`
    )

    return normalizeResults(await response.json());
}



function button_worker(state, param, value){

    get_caffeine(state).then(json => {
        //console.log(json);
        Search(param, value).then(json_search => {

            //console.log(intersectByName(json_search, json));
            let output_json = intersectByName(json_search.results, json.results)

            console.log(output_json);
            for (var i = 0; i < output_json.length; i++){
                console.log(output_json[i]);
                new_section(output_json[i], output_json[i].Name, output_json[i].Type, output_json[i].caffeine, output_json[i].ingredients, output_json[i].Brand, output_json[i]["amount per cut weight G"], output_json[i]['steep time (mins)'])

            }
            //new_section(1, 'sleepy time','green', false, 'mango, cat food,', 'acme', '20g', '5' )

        });
    })


    //console.log(Json_Convert(search));
}

function run_onclick(){
    removeElementsByClass ("card");
    button_worker(document.getElementById('caffeine-checkbox').checked,
        document.getElementById('Param').value,
        document.getElementById('site-search').value)

}

