const assert = (cond, msg = "") => {
    if(!cond){
        console.error("Assertion Error " + msg);
    }
};
const HTML = (tagname, attrs, ...children) => {
    if(attrs === undefined) return document.createTextNode(tagname);
    const ele = document.createElement(tagname);
    if(attrs) for(const [key, value] of Object.entries(attrs)){
        if(value === null || value === undefined) continue;
        if(key.charAt(0) === "_"){
            const type = key.slice(1);
            ele.addEventListener(type, value);
        }
        else if(key === "eventListener"){
            for(const listener of value){
                ele.addEventListener(listener.type, listener.listener, listener.options);
            }
        }
        else ele.setAttribute(key, value);
    }
    for(const child of children) if(child) ele.append(child);
    return ele;
};
const snippet_weights = [
    [700, 700, 700, 700, 700, 700, 700, 700, 700],
    [700, 700, 700, 700, 700, 700, 700, 700, 525],
    [600, 600, 600, 600, 600, 600, 600, 450, 300],
    [600, 600, 600, 600, 600, 600, 450, 300, 150],
    [500, 500, 500, 500, 500, 375, 375, 250, 125],
    [400, 400, 400, 400, 300, 300, 200, 200, 100],
];
const unique_snippet_weights = [
    [600, 600, 600, 600, 600, 600, 600, 600, 600],
    [300, 300, 300, 300, 300, 300, 300, 300, 200],
    [150, 150, 150, 150, 150, 150, 150, 100, 50],
    [60, 60, 60, 60, 60, 60, 40, 20, 10],
    [30, 30, 30, 30, 30, 20, 20, 10, 5],
    [6, 6, 6, 6, 4, 4, 2, 2, 1],
];
const snippet_weights_flat = snippet_weights.flat();
const total_snippet_weight = snippet_weights.reduce((total, arr) => total + arr.reduce((total, weight) => total + weight, 0), 0);
console.log(total_snippet_weight);
const snippet_rarities = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 2],
    [0, 0, 0, 0, 0, 0, 1, 2, 3],
    [0, 0, 0, 0, 0, 1, 1, 2, 3],
    [0, 0, 0, 0, 1, 1, 2, 2, 3],
];
const rarity_text = ["Common", "Rare", "Epic", "Legendary"]
const total_snippet_weight_with_rarity = [0, 1, 2, 3].map(rarity => snippet_rarities.reduce((total, row, i) => total + row.reduce((total, col, j) => col === rarity ? total + snippet_weights[i][j] : total, 0), 0) / total_snippet_weight);
console.log(total_snippet_weight_with_rarity);
const album_elem = document.getElementById("album");
const control_ele = document.getElementById("controls");
const control_texts = document.getElementById("texts");
const control_buttons = document.getElementById("buttons");
const snippet_elements = snippet_rarities.map((arr, i) => {
    const children = arr.map((rarity, j) => 
        HTML("div", {class: "snippet " + rarity_text[rarity].toLowerCase()}, snippet_weights[i][j])
    );
    const ele = HTML("div", {class: "scene"}, ...children);
    album_elem.append(ele);
    return children;
});
console.log(snippet_elements);
const Swap = ([r1, c1], [r2, c2]) => {
    r1 -= 1; c1 -=1; r2 -= 1; c2 -= 1;
    const ele1 = snippet_elements[r1][c1];
    const ele2 = snippet_elements[r2][c2];
    const temp = document.createElement("div");
    ele1.parentNode.insertBefore(temp, ele1);
    ele2.parentNode.insertBefore(ele1, ele2);
    temp.parentNode.insertBefore(ele2, temp);
    temp.parentNode.removeChild(temp);
};
Swap([2, 2], [2, 9]);
Swap([3, 1], [3, 9]);
Swap([3, 6], [3, 8]);
Swap([4, 1], [4, 8]);
Swap([4, 7], [4, 9]);
Swap([5, 2], [5, 9]);
Swap([5, 6], [5, 8]);
Swap([5, 1], [5, 6]);
Swap([6, 1], [6, 9]);
Swap([6, 2], [6, 8]);
Swap([6, 1], [6, 7]);
Swap([6, 4], [6, 5]);
Swap([6, 6], [6, 1]);
class _RollHelper{
    #weighted_items = [];
    #total_weight = 0;
    #current_total = 0;

    #unique_items = [];
    #unique_weight = 0;
    #current_unique = 0;

    #back = 0;
    constructor(weighted_items, unique_items){
        assert(weighted_items.length === unique_items.length);
        this.#weighted_items = weighted_items;
        this.#unique_items = unique_items;
        this.#total_weight = this.#weighted_items.reduce((total, [weight, item]) => total + weight, 0);
        this.#unique_weight = this.#unique_items.reduce((total, [weight, item]) => total + weight, 0);
        this.reset();
    }
    reset(){
        this.#current_total = this.#total_weight;
        this.#current_unique = this.#unique_weight;
        this.#back = this.#weighted_items.length - 1;
    }
    roll(is_unique = false){
        let pos = 0;
        let unique = true;
        if(!is_unique){
            let remain = Math.floor(Math.random() * this.#total_weight);
            if(remain >= this.#current_total)
                unique = false;
            while(remain >= this.#weighted_items[pos][0]){
                remain -= this.#weighted_items[pos][0];
                pos += 1;
            }
            //assert(unique || pos > this.#back); 
        }
        else{
            let remain = Math.floor(Math.random() * this.#current_unique);
            while(remain >= this.#unique_items[pos][0]){
                remain -= this.#unique_items[pos][0];
                pos += 1;
            }
        }
        const ret = this.#weighted_items[pos][1];
        if(unique){
            this.#current_total -= this.#weighted_items[pos][0];
            this.#current_unique -= this.#unique_items[pos][0];

            let temp = this.#weighted_items[this.#back];
            this.#weighted_items[this.#back] = this.#weighted_items[pos];
            this.#weighted_items[pos] = temp;
            temp = this.#unique_items[this.#back];
            this.#unique_items[this.#back] = this.#unique_items[pos];
            this.#unique_items[pos] = temp;
            
            this.#back -= 1;
        }

        return [ret, unique];
    }
    has_item(){
        return this.#back >= 0;
    }
    remains(){
        return this.#back + 1;
    }
    check(){
        let _current = 0, _unique = 0;
        for(let i = 0; i <= this.#back; i++){
            _current += this.#weighted_items[i][0];
            _unique += this.#unique_items[i][0];
        }
        assert(this.#current_total === _current, `current_total: ${this.#current_total}, _current: ${_current}`);
        assert(this.#current_unique === _unique, `current_unique: ${this.#current_unique}, _unique: ${_unique}`);
        for(let i = this.#back + 1; i < this.#weighted_items.length; i++){
            assert(this.#weighted_items[i][1] === this.#unique_items[i][1], `pos ${i} don't match`);
        }
    }
}
const RollHelper = new _RollHelper(snippet_weights.flat(1).map((weight, i) => [weight, i]), unique_snippet_weights.flat(1).map((weight, i) => [weight, i]));
let bonus = 0;
let selected_snippet = null;
const SetSelected = (row, col) => {
    //console.log(row, col);
    snippet_elements[row][col].classList.add("obtained");
    snippet_elements[row][col].classList.add("selected");
    if(selected_snippet) selected_snippet.classList.remove("selected");
    selected_snippet = snippet_elements[row][col];
}
const RollOnce = (unique = false, detach = false) => {
    if(unique && !RollHelper.has_item()){
        bonus += 1;
        return 0;
    }
    const [ind, is_unique] = RollHelper.roll(unique);
    //RollHelper.check();
    //assert(!unique || is_unique);
    const row = Math.floor(ind / 9);
    const col = ind - row * 9;
    //assert(!is_unique || !snippet_elements[row][col].classList.contains("obtained"));
    if(!detach) SetSelected(row, col);
    if(!is_unique){
        return snippet_rarities[row][col] + 3;
    }
    return 0;
};
let pity = 0;
const pity_required_for_unique = 6;
let roll_cnt = 0;
const roll_cnt_ele_text = "Rolled: 0";
const bonus_cnt_ele_text = "";
const pity_cnt_ele_text = `0/${pity_required_for_unique}`;
const unique_text = "";
const roll_cnt_ele = HTML("div", {class: "roll-cnt"}, roll_cnt_ele_text);
const bonus_cnt_ele = HTML("div", {class: "roll-cnt"}, bonus_cnt_ele_text);
const pity_cnt_ele = HTML("div", {class: "roll-cnt"}, pity_cnt_ele_text);
const unique_ele = HTML("div", {class: "roll-cnt"}, unique_text);
const Roll = (cnt = 1, detach = false, event_bonus = false) => {
    let pity_cnt = 0;
    for(let i = 0; i < cnt; i++){
        const this_pity = RollOnce(false, detach);
        //console.log(this_pity);
        pity += this_pity;
        if(pity >= pity_required_for_unique){
            pity_cnt += 1;
            pity -= pity_required_for_unique;
            RollOnce(true, detach);
        }
    }
    if(event_bonus && roll_cnt % 28 + cnt >= 28){
        RollOnce(false, detach);
        RollOnce(false, detach);
        RollOnce(true, detach);
    }
    roll_cnt += cnt;
    if(!detach){
        roll_cnt_ele.textContent = `Rolls: ${roll_cnt}`
        bonus_cnt_ele.textContent = bonus ? ` (+${bonus} bonus)` : "";
        pity_cnt_ele.textContent = `${pity}/${pity_required_for_unique}`;
        unique_ele.textContent = pity_cnt > 0 ? ` (+${pity_cnt} unique)` : "";
    }
};
const Loop = async (func, cnt) => {
    for(let i = 0; i < cnt; i++){
        func();
        await new Promise((res) => setTimeout(res, 50));
    }
};
const roll_once_btn = HTML("button", {class: "roll", _click: () => Roll(1)}, "Roll Once");
const roll_four_times_btn = HTML("button", {class: "roll", _click: () => Loop(() => Roll(), 4)}, "Roll Four Times");
control_texts.append(roll_cnt_ele);
control_texts.append(bonus_cnt_ele);
control_texts.append(HTML("div", {class: "br"}));
control_texts.append(pity_cnt_ele);
control_texts.append(unique_ele);
control_texts.append(HTML("div", {class: "br"}));
control_buttons.append(roll_once_btn);
control_buttons.append(roll_four_times_btn);
const Restart = (detach = false) => {
    pity = 0; roll_cnt = 0; bonus = 0;
    RollHelper.reset();
    if(!detach){
        snippet_elements.forEach(row => row.forEach(col => col.classList.remove("obtained")));
        roll_cnt_ele.textContent = roll_cnt_ele_text;
        pity_cnt_ele.textContent = pity_cnt_ele_text;
    }
};
const restart_btn = HTML("button", {class: "roll", _click: () => Restart()}, "Restart");
control_buttons.append(restart_btn);
const Emulate = () => {
    const times = 100_000;
    const len = 150;
    const result = new Array(len).fill(0);
    Restart();
    for(let i = 0; i < times; i++){
        while(RollHelper.has_item()){
            Roll(1, true, true);
        }
        result[roll_cnt] += 1;
        Restart(true);
    }
    const accumulated = result.reduce((arr, cur) => {
        arr.push(arr.at(-1) + cur);
        return arr;
    }, [0]).map(i => i / times);
    accumulated.shift();
    console.log(result);
    console.log(accumulated);
};
const Emulate2 = () => {
    const times = 500_000;
    const len = 20;
    const result = new Array(len).fill(0);
    Restart();
    for(let i = 0; i < times; i++){
        let rolls = 0;
        while(RollHelper.has_item() && rolls < 84){
            Roll(1, true, true);
            rolls += 1;
        }
        if(RollHelper.has_item()) result[RollHelper.remains()] += 1;
        else result[0] += 1;
        Restart(true);
    }
    const accumulated = result.reduce((arr, cur) => {
        arr.push(arr.at(-1) + cur);
        return arr;
    }, [0]).map(i => i / times);
    accumulated.shift();
    console.log(result);
    console.log(accumulated);
};
const emulate_btn = HTML("button", {class: "roll", _click: () => Emulate()}, "Emulate 100k");
control_buttons.append(emulate_btn);