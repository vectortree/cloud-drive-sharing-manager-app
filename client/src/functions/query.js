const operators = ["drive", "owner", "creator", "from", "to", "readable", "writable", "sharable", "name", "inFolder", "folder", "path", "sharing"]

/* 
    This function parses a textual query into a tree data structure 
    Here is an an example of a textual query and its corresponding tree structure.

    const searchQueryTextual = " folder:”Cool Project” and (readable:"alice@gmail.com" or readable:"bob@gmail.com") and -name:".*\.log" "
    const searchQueryParsed = {
        logicalOp: "and"
        children: [
            0: {op: folder, arg: "Cool Project", negative: False},
            1: {
                logicalOp: "or"
                children: [
                    0: {op: readable, arg: "alice@gmail.com", negative: False},
                    1: {op: readable, arg: "bob@gmail.com", negative: False}
                ]
            },
            2: {op: name, arg: ".*\.log", negative: True}
        ]
      }
*/
function serializeSearchQuery(s) {
    let sq = {};
    let parenthesesBalance = 0;
    let child;
    let children = [];
    let logicalOperator;
    let i = 0;
    while (i < s.length) {
        if (s[i] === "(") {
            parenthesesBalance++;
            i++;
            let subQuery = "";
            while (true) {
                if (s[i] === "(") parenthesesBalance++;
                if (s[i] === ")") parenthesesBalance--;
                if (parenthesesBalance === 0) break;
                subQuery += s[i];
                i++;
                if (i === s.length) return { error: "Parentheses are not balanced." };
            }

            child = serializeSearchQuery(subQuery);
            if (child.error) return child;

            children.push(child);
        }

        else {
            let negative = false;
            if (s[i] === "-") {
                negative = true;
                i++;
            }
            let valid = false;
            for (const op of operators) {
                if (s.slice(i).startsWith(op)) {
                    valid = true;
                    i += op.length;
                    if (s[i] !== ":" || s[i + 1] !== "\"") return { error: "Query parameters must be in the form <operator>:\"<argument>\"." };
                    i += 2;
                    let queryArg = "";
                    while (s[i] !== "\"") {
                        queryArg += s[i];
                        i++;
                        if (i === s.length) return { error: "Missing quotation at the end of your argument." };
                    }
                    child = { negative: negative, operator: op, argument: queryArg};
                    children.push(child);
                    break;
                }
            };
            if (!valid) return { error: "Invalid query operator used." }
        }

        i++;
        if (i === s.length) break;
        if (s[i] !== " " && s[i] !== "\t") return { error: "Queries must be separated by a whitespace character." };
        while (s[i] === " " || s[i] === "\t") i++;
        if (s.slice(i).startsWith("and")) {
            if (!logicalOperator)
                logicalOperator = "and";
            else if (logicalOperator === "or") return { error: "If using multiple logical operators, use a set of parentheses to indicate which should be evaluated first." };
            i += 3;

        } else if (s.slice(i).startsWith("or")) {
            if (!logicalOperator)
                logicalOperator = "or";
            else if (logicalOperator === "and") return { error: "If using multiple logical operators of different types, use a set of parentheses to indicate which should be evaluated first." };
            i += 2;

        } else return { error: "If including multiple query parameters, you must separate them by either an 'and' or 'or' logical operator." };

        if (s[i] !== " " && s[i] !== "\t") return { error: "Queries must be separated by a whitespace character." };
        while (s[i] === " " || s[i] === "\t") i++;
    }

    if (children.length === 1) {
        return children[0];
    }

    sq["logicalOp"] = logicalOperator;
    sq["children"] = children;
    return sq;
}

/* 
    This function takes a structured search query, sq, and deserializes it into a string 
    that the user can undertand.
*/
function deserializeSearchQuery(sq) {
    let s = "";

    // This section processes an individual operator and its argument and negativity status
    if (!sq["children"]) {
        if (sq["negative"])
            s += "-";
        s += sq["operator"] + ":" + "\"" + sq["argument"] + "\"";
        return s;
    }

    sq["children"].forEach((child, index) => {
        if (index !== 0) {
            s += " " + sq["logicalOp"] + " ";
        }
        s += deserializeSearchQuery(child);
    })
    return "(" + s + ")";
}

export { serializeSearchQuery, deserializeSearchQuery };