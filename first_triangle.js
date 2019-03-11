
/// <reference path="webgl.d.ts" />

// install node.js
// exit, start vs code
// terminal: ctrl-shift-' or view/terminal
// npm install -g eslint

main();

function vertex(...args)
{
    var combined = [];
    args.forEach(function(element)
    {
        combined = combined.concat(element);
    });
    return combined;
}


function main() {
    
    var gl;
    var points;

    window.onload = function init() {
        var canvas = document.getElementById("gl-canvas");
        gl = WebGLUtils.setupWebGL(canvas, {});
    
        if (!gl) {
            alert("WebGL isn't available");
        }

        // Three Vertices
        var vertices = [

            //Branch Verticies 
            vertex(vec3(-.1,0, 0), vec3(0,1,0)),
            vertex(vec3(-.1,.6, 0), vec3(1,0,0)),
            vertex(vec3(.1,.6, 0), vec3(0,0,1)),
            vertex(vec3(.1,0, 0), vec3(0,0,1)),
            
            //Leaf Verticies 
            vec3(.1, 0, 0), vec3(-1,0,0),
            vec3(.2, .4, .4), vec3(0,1,0),
            vec3(.1, 0, 0), vec3(-1,0,0),
            vec3(-.2, .4, .4), vec3(0,1,0),


        ];


        //  Configure WebGL   
        //    
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.2, 0.2, 0.2, 1.0);

        //  Load shaders and initialize attribute buffers

       var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        // Load the data into the GPU        

        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

        // Associate out shader variables with our data buffer
        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 6*4, 0);
        gl.enableVertexAttribArray(vPosition);

        var aColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 6*4, 3*4);
        gl.enableVertexAttribArray(aColor);      

         var uTheta = gl.getUniformLocation(program, "uTheta");      

        var u_xForm = gl.getUniformLocation(program, "u_xForm");

        //universal variables 
        var previousTime = 0;
        //amount of branches drawn 
        var depth=1;
        var bOffset=[];
        //goes through num branches being drawn 
        var numB=1;
        var totB=0;
        for(var i=0;i<depth;i++){
            numB*=3;
            totB+=numB;
        }
        for(var i=0;i<totB;i++){
            bOffset.push(40);
        }

        //draws the center branches of the tree 
        function Draw(in_xForm, in_count,ourOffset,scale2){
        
            var combinedMatrix = flatten(in_xForm);
            gl.uniformMatrix4fv(u_xForm, false, combinedMatrix);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

            var heightDiv2 = .6 
            var xForm = mat4();
            var theta2=((theta*bOffset[Math.floor(ourOffset)]))/40;

                xForm=mult(xForm,rotateZ(180*theta2/Math.PI));
               var scale = scalem(.8, .8, 0);
                xForm = mult(scale, xForm);
                var move = translate(0, heightDiv2,0);
                xForm = mult(move, xForm);
               
            xForm = mult(in_xForm, xForm); 
            if(in_count > 1){
                DrawLeft(xForm, in_count - 1,ourOffset,scale2/3);
                DrawRight(xForm, in_count-1,ourOffset+scale2/3,scale2/3);
                Draw(xForm, in_count-1,ourOffset+scale2*2/3,scale2/3);
            }
         }

         //draws the left branches on the tree 
        function DrawLeft(in_xForm, in_count,ourOffset,scale2){
        
           var combinedMatrix = flatten(in_xForm);
            gl.uniformMatrix4fv(u_xForm, false, combinedMatrix);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

            var heightDiv2 = .6 
            var xForm = mat4();
             xForm = mult(rotateZ(200),xForm);
             var theta2=((theta+bOffset[Math.floor(ourOffset)])-20)/2;
             xForm=mult(xForm,rotateZ(180*theta2/Math.PI));
               var scale = scalem(.8, .8, 0);
                xForm = mult(scale, xForm);
                var move = translate(0, heightDiv2,0);
                xForm = mult(move, xForm);
               
            xForm = mult(in_xForm, xForm); 
            if(in_count > 1){
                DrawLeft(xForm, in_count - 1,ourOffset,scale2/3);
                DrawRight(xForm, in_count-1,ourOffset+scale2/3,scale2/3);
                Draw(xForm, in_count-1,ourOffset+scale2*2/3,scale2/3);
            }
        }

        //draws the right branches on the tree
        function DrawRight(in_xForm, in_count,ourOffset,scale2){
        
            var combinedMatrix = flatten(in_xForm);
            gl.uniformMatrix4fv(u_xForm, false, combinedMatrix);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

            var heightDiv2 = .6; 
            var xForm = mat4();
             xForm = mult(rotateZ(80),xForm);

             var theta2=((theta+bOffset[Math.floor(ourOffset)])-20)/2;
             
             xForm=mult(xForm,rotateZ(180*theta2/Math.PI));
               var scale = scalem(.8, .8, 0);
                xForm = mult(scale, xForm);
                var move = translate(0, heightDiv2,0);
                xForm = mult(move, xForm);
               
            xForm = mult(in_xForm, xForm); 
            if(in_count > 1){
                DrawLeft(xForm, in_count - 1,ourOffset,scale2/3);
                DrawRight(xForm, in_count-1,ourOffset+scale2/3,scale2/3);
                Draw(xForm, in_count-1,ourOffset+scale2*2/3,scale2/3);
            }
         }

         var theta = 0;
         var rotationRate = 0.2;
         var previousTime = 0;
         var toP=0;

        document.getElementById("numBranch").onchange = function(event) {
            depth = event.target.value;
            DrawLeft(xForm, in_count,ourOffset,scale2);
            DrawRight(xForm, in_count,ourOffset,scale2);
            Draw(xForm, in_count,ourOffset,scale2);
        };

        function render(currentTime)
        {
            toP++;
            gl.clear(gl.COLOR_BUFFER_BIT);

                previousTime = currentTime;
                theta=Math.PI*(Math.abs((currentTime/100)%80-40)-20)/360;
                gl.uniform1f(uTheta, 0);
            
            
            if(0){
                var combinedMatrix = mat4(); 
                combinedMatrix = flatten(combinedMatrix); 
                gl.uniformMatrix4fv(u_xForm, false, combinedMatrix);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
            }
            else{
                
                 var combinedMatrix = translate(0, -1, 0);
                combinedMatrix=mult (combinedMatrix, rotateZ(90*theta/Math.PI));
                Draw(combinedMatrix, depth,0,totB/3);
                DrawLeft(combinedMatrix, depth,totB/3,totB/3);
                DrawRight(combinedMatrix, depth,totB*2/3,totB/3);
                }

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

    }
}
