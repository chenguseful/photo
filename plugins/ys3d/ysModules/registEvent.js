import {isMobile} from "./normal.js"
/** tap */
function tap(el, callback, useCapture){
    let  startTime = 0
    let  isMove = false
    el.addEventListener('touchstart', () => startTime = Date.now(),useCapture)
    el.addEventListener('touchmove',()=> isMove = true,useCapture)
    el.addEventListener('touchend',e => {
        (Date.now() - startTime < 300) && !isMove && callback ? callback(e) : ''
        startTime = 0
        isMove = false
    },useCapture)
}
/** 长按 */
function longPress(el, callback, useCapture){
    let timer
    el.addEventListener("touchstart", function (e) {
        timer = setTimeout(function () {
            e.preventDefault()
            callback(e)
        }, 800)
    },useCapture)
    el.addEventListener("touchmove", function (e) {
        clearTimeout(timer)
        timer = 0
    },useCapture);
    el.addEventListener("touchend", function (e) {
        clearTimeout(timer)
        return false
    },useCapture)
}

/** 组合**/
function dbclick(el,callback,useCapture) {
    isMobile() ? tap(el, callback, useCapture) : el.addEventListener('dblclick',e=> callback(e), useCapture)
}
function click_tap (el,callback,useCapture) {
    isMobile() ? tap(el, callback, useCapture) : el.addEventListener('click',e=> callback(e), useCapture)
}
function mousemove_touchmove (el,callback,useCapture) {
    isMobile() ? el.addEventListener('touchmove',e => callback(e), useCapture) : el.addEventListener('mousemove',e => callback(e), useCapture)
}
function mousedown_touchstart (el,callback,useCapture) {
    isMobile() ? el.addEventListener('touchstart',e => callback(e), useCapture) : el.addEventListener('mousedown',e => callback(e), useCapture)
}
function mouseup_touchend (el,callback,useCapture) {
    isMobile() ? el.addEventListener('touchend',e => callback(e), useCapture) : el.addEventListener('mouseup',e => callback(e), useCapture)
}
function wheel(el,callback,useCapture) {
    el.addEventListener('mousewheel', function () {
        callback(event.wheelDelta)
    },useCapture)
    el.addEventListener('DOMMouseScroll', function(event) {
        callback(-event.detail) //firefox只支持DOMMouseScroll
    },useCapture)
}


export default  function (event,callback,useCapture) {
    switch (event) {
        // 移动端
        case 'tap':
            tap(this,callback,useCapture)
            break;
        case 'longPress':
            longPress(this,callback,useCapture)
            break;
        //组合
        case 'dbclick':
            dbclick(this,callback,useCapture)
            break;
        case 'click_tap':
            click_tap(this,callback,useCapture)
            break;
        case 'mousemove_touchmove':
            mousemove_touchmove(this,callback,useCapture)
            break;
        case 'mousedown_touchstart':
            mousedown_touchstart(this,callback,useCapture)
            break;
        case 'mouseup_touchend':
            mouseup_touchend(this,callback,useCapture)
            break;
        case 'wheel':
            wheel(this,callback,useCapture)
            break;
    }
}
/*
示例
el.listen('tap',function () {
    console.log("....")
})
el.listen('click_tap',function (e) {
    console.log(e)
},true)
el.listen('mousedown_touchstart',function (e) {
    console.log(e)
},true)
el.listen('mousemove_touchmove',function (e) {
    console.log(e)
},true)
el.listen('mouseup_touchend',function (e) {
    console.log(e)
},true)*/
