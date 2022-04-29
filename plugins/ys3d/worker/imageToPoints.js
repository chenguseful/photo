onmessage = function (e) {
    let data = e.data
    const obj = createPotCloud(data.imgDate,data.canvas, data.color)
    postMessage(obj)
    self.close()
}
function createPotCloud(imgDate,canvas, color) {
    const particles = canvas.width * canvas.height
    const positions = new Float32Array( particles * 3 )
    const colors = new Float32Array( particles * 3 )
    for ( let i = 0; i < positions.length; i ++ ) {
        if(imgDate.data[ 4*i ]/255.0!==color[0] && imgDate.data[ 4*i + 1]/255.0!==color[1] && imgDate.data[ 4*i + 2]/255.0!==color[2] ) { //过滤纯黑色 或 透明

            // positions
            positions[ 3*i ] = parseInt(i%canvas.width)
            positions[ 3*i + 1 ] =  0 ;
            positions[ 3*i + 2 ] = - parseInt((canvas.height-i)/canvas.width) //取反

            // colors
            colors[ 3*i ] = imgDate.data[ 4*i ]/255.0
            colors[ 3*i + 1 ] = imgDate.data[ 4*i + 1]/255.0
            colors[ 3*i + 2 ] = imgDate.data[ 4*i + 2]/255.0
        }
    }
    return {
        positions,
        colors
    }
}