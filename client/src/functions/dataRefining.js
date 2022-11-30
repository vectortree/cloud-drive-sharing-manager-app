
export function dataRefining(SearchQuery){
    let searchQuery_Grid = [];

    for(let i = 0; i < SearchQuery.length; i++){
        let queryString="{";
        if(SearchQuery[i].searchQuery.argument){
            queryString += SearchQuery[i].searchQuery.operator + ":"+SearchQuery[i].searchQuery.argument+"}"
        }else if(SearchQuery[i].searchQuery.children){
            const childrenLength = SearchQuery[i].searchQuery.children.length
            for(let j = 0; j < childrenLength   -1; j++){

                queryString += SearchQuery[i].searchQuery.children[j].operator + ":"+SearchQuery[i].searchQuery.children[j].argument+" "+ SearchQuery[i].searchQuery.logicalOp+ " ";
            }
            queryString += SearchQuery[i].searchQuery.children[childrenLength-1].operator + ":"+SearchQuery[i].searchQuery.children[childrenLength-1].argument+"}";
        }
        searchQuery_Grid.push(
            {
                id: SearchQuery[i].id,
                name: queryString
            })
    }
    return searchQuery_Grid;
}