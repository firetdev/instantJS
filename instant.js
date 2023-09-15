//Originally written by Yeshaya Zeff (flesheatindragon) in 2020
//Last updated/maintained: 9/15/2023 by flesheatindragon
var c = document.getElementById("c");
var ctx = c.getContext("2d");
var offX = 0;
var offY = 0;
var mouseX;
var mouseY;
var scaleX = 1;
var scaleY = 1;
var mousestate = false;
var unmoving = false;
var keys = {};
var modAllowed = false;
var modLoaded = false;
var gameBlocks = [];
var currentScene = 0;
var framerate = 1000/60;

window.addEventListener("keydown", function(e){
    let ck = e.key;
    keys.ck = true;
});

window.addEventListener("keyup", function(e){
    let ck = e.key;
    keys[ck] = false;
});

function setScene(scene){
    currentScene = scene;
}

function startGame(){
    currentScene.loop();
    window.setTimeout("startGame()", framerate);
}

window.addEventListener("mousemove", function(e){
    mouseX = e.clientX - parseInt(window.getComputedStyle(c, null).paddingLeft) * scaleX;
    mouseY = e.clientY - parseInt(window.getComputedStyle(c, null).paddingTop) * scaleY;
});
window.addEventListener("touchmove", function(e){
    mouseX = e.clientX - parseInt(window.getComputedStyle(c, null).paddingLeft) * scaleX;
    mouseY = e.clientY - parseInt(window.getComputedStyle(c, null).paddingTop) * scaleY;
});

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

function Text(x, y, size, font, text, color){
    this.x = x;
    this.y = y;
    this.font = size + font;
    this.text = text;
    this.color = color;
    this.render = function(){
        ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.fillText(this.text, this.x, this.y);
    }
    conLog("Text");
}

function drawText(txt, x, y, s, f, c){
    ctx.font = s + "px " + f;
    ctx.fillStyle = c;
    ctx.fillText(txt, x, y);
}

function scale(x, y){
    c.width *= x;
    c.height *= y;
    ctx.scale(x, y);
    scaleX = x;
    scaleY = y;
}

function screenScale(){
    if(document.documentElement.clientWidth > document.documentElement.clientHeight){
        scale(document.documentElement.clientHeight / 400 / 1.5 * 1.2, document.documentElement.clientHeight / 300 / 2 * 1.2);
    } else{
        scale(document.documentElement.clientWidth / 400 / 2.9 * 1.2, document.documentElement.clientWidth / 300 / 2.9 * 1.2);
    }
}

function handleInputDown(input, result){
    window.addEventListener(`keydown`, function(e){
        if(e.key.toLowerCase() == input){
            result();
            conLog("Key input!");
        }
    });
}

function handleClick(result){
    window.addEventListener(`click`, function(e){
        result();
    });
    window.addEventListener(`touchend`, function(e){
        result();
    });
}

function handleMouseDown(){
    window.addEventListener("mousedown", function(){
        mousestate = true;
    });
    window.addEventListener("touchstart", function(){
        mousestate = true;
    });
    window.addEventListener("mouseup", function(){
        mousestate = false;
    });
    window.addEventListener("touchend", function(){
        mousestate = false;
    });
}

function blockTilemap(map, size, sprite){
    let result = [];
    for(i = 0; i < map.length; i++){
        for(e = 0; e < map[i].length; e++){
            if(map[i][e] == 1){
                result.push(new Block(sprite, e * size, i * size, size, size));
            }
        }
    }
    return result;
}

function imgDraw(img, x, y, w, h){
    let imagen = new Image();
    imagen.src = img;
    ctx.drawImage(imagen, x, y, w, h);
}

function Scene(config){
    this.loop = config;
}

function Block(sprite, x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.img = true;
    this.sprite = sprite;
    if(this.img){
        this.sprite = new Image();
    }
    this.sprite.src = sprite;
    this.render = function(){
        if(!this.img){
            render(this.sprite, this.x, this.y, this.w, this.h);
        } else{
            ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
        }
    }
    this.collidesWith = function(body){
    	if(this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h){
    		body.x = this.x + this.w;
    		body.onPlat = true;
    		body.onPlat = true;
    		return true;
    	} else if(this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h){
    		body.onPlat = true;
    		body.y = this.y - body.h;
    		body.onPlat = true;
    		return true;
        } else if(this.x >= body.x && this.x <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h){
    		body.onPlat = true;
    		body.y = this.y - (body.h);
    		return true;
    	} else if(this.x >= body.x && this.x <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h){
            body.x = this.x - (body.w);
    		body.onPlat = true;
    		return true;
        } else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y > this.y && body.y + body.h < this.y + this.h){
    		body.onPlat = true;
    		return true;
    	} else if(body.x< this.x + this.w && body.x + body.w > this.x + this.w && body.y > this.y && body.y + body.h <= this.y + this.h){
            body.x = this.x + (this.w);
    		body.onPlat = true;
    		return true;
    	} else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y < this.y && body.y + body.h > this.y){
    		body.onPlat = true;
            body.y = this.y - body.h;
    		return true;
    	} else if(this.x < body.x && this.x + this.w > body.x + body.w && this.y + this.h > body.y && this.y + this.h < body.y + body.h){
    		body.onPlat = true;
            body.y = this.y + this.h;
    		return true;
    	} else if(this.x > body.x && this.x < body.x + body.w && this.y < body.y && this.y + this.h > body.y + body.h){
            body.onPlat = true;
            body.x = this.x - body.w;
            return true;
        } else if(this.x < body.x && this.x + this.w > body.x && this.y < body.y && this.y + this.h > body.y + body.h){
            body.onPlat = true;
            body.x = this.x + this.w;
            return true;
        } else{
    	    body.onPlat = false;
    		return false;
    	}
    }
    gameBlocks.push(this);
}

//Testing only
function PhysicsBody(sprite, x, y, w, h, camx, camy, grav, mass, mode){
    this.x = x;
    this.sx = x;
    this.sy = y;
    this.camx = camx;
    this.camy = camy;
    if(camx == null){
        camx = false;
    }
    if(camy == null){
        camy = false;
    }
    this.y = y;
    this.lx = x;
    this.ly = y;
    this.w = w;
    this.h = h;
    this.mass = mass;
    this.grav = grav;
    this.onPlat = false;
    this.img = true;
    this.sprite = sprite;
    this.mode = mode;
    this.velX = 0;
    this.velY = 0;
    if(this.img){
        this.sprite = new Image();
    }
    this.sprite.src = sprite;
    this.render = function(){
        if(!this.img){
            render(this.sprite, this.x, this.y, this.w, this.h);
        } else{
            ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
        }
    }
    this.updatePhysics = function(){
        if(this.onPlat == false){
            this.velY += this.grav;
        }
        if(this.velX > 0){
            this.velX -= this.mass;
        }
        if(this.velX < 0){
            this.velX += this.mass;
        }
        if(this.velX > 0){
            this.velX -= 1;
        }
        if(this.velX < 0){
            this.velX += 1;
        }
        this.move(this.velX, this.velY);
    }
    this.applyForce = function(fX, fY){
        this.velX += fX;
        this.velY += fY;
    }
    this.move = function(x, y){
        let s1 = this.x;
        let s2 = this.y;
        this.x += x;
        this.y += y;
        if(x > 0){
            this.lx = 0;
            unmoving = false;
        } else if(x < 0){
            this.lx = 600;
            unmoving = false;
        }
        if(y > 0){
            this.ly = 0;
            unmoving = false;
        } else if(y < 0){
            this.ly = 600;
            unmoving = false;
        }
        if(s1 != this.x && !this.onPlat){
            if(this.camx){
                ctx.translate(-x, 0);
                offX += x;
                if(offX != this.x - this.sx && !unmoving){
                    offX = this.x - this.sx;
                    ctx.translate(x, 0);
                    unmoving = true;
                    //return;
                } else{
                    unmoving = false;
                }
                if(unmoving){
                    unmoving = false;
                }
            }
        }
        if(s2 != this.y && !this.onPlat){
            if(this.camy){
                ctx.translate(0, -y);
                offY += y;
                if(offY != this.y - this.sy && !unmoving){
                    offY = this.y - this.sy;
                    ctx.translate(0, y);
                    unmoving = true;
                    //return;
                } else{
                    unmoving = false;
                }
                if(unmoving){
                    unmoving = false;
                }
            }
        }
    }
    this.bounce = function(){
        let nx = -this.velX;
        let ny = -this.velY;
        if(this.mode == "b"){
            nx = -this.velX;
            ny = -this.velY;
        }
        if(this.mode == "n"){
            if(this.velX > 0){
                nx = -this.velX + (this.mass * 2);
            } else{
                nx = -this.velX - (this.mass * 2);
            }
            if(this.velY > 0){
                ny = -this.velY + (this.mass * 2);
            } else{
                ny = -this.velY - (this.mass * 2);
            }
        }
        if(this.mode == "s"){
            nx = 0;
            ny = 0;
        }
        let n = [nx, ny];
        return n;
    }
    this.bounceR = function(x, y, r){
        let nx = -x + Math.random() * r - (r / 1.9);
        let ny = -y + Math.random() * r - (r / 1.9);
        let n = [nx, ny];
        return n;
    }
    this.collidesWith = function(body){
    	if(this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h || this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h){
    		return true;
    	} else if(this.x >= body.x && this.x <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h || this.x >= body.x && this.x <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h){
    		return true;
    	} else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y > this.y && body.y + body.h < this.y + this.h){
    		return true;
    	} else if(body.x < this.x + this.w && body.x + body.w > this.x + this.w && body.y > this.y && body.y + body.h < this.y + this.h){
    		return true;
    	} else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y < this.y && body.y + body.h > this.y){
    		return true;
    	} else if(this.x < body.x && this.x + this.w > body.x + body.w && this.y + this.h > body.y && this.y + this.h < body.y + body.h){
    		return true;
    	} else{
    		return false;
    	}
    }
}

function Character(sprite, x, y, w, h, camx, camy){
    this.x = x;
    this.sx = x;
    this.sy = y;
    this.camx = camx;
    this.camy = camy;
    if(camx == null){
        camx = false;
    }
    if(camy == null){
        camy = false;
    }
    this.y = y;
    this.lx = x;
    this.ly = y;
    this.w = w;
    this.h = h;
    this.onPlat = false;
    this.img = true;
    this.sprite = sprite;
    if(this.img){
        this.sprite = new Image();
    }
    this.sprite.src = sprite;
    this.extend = function(code){
        this.extension = code;
    }
    this.render = function(){
        if(!this.img){
            render(this.sprite, this.x, this.y, this.w, this.h);
        } else{
            ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
        }
    }
    this.move = function(x, y){
        let s1 = this.x;
        let s2 = this.y;
        this.x += x;
        this.y += y;
        if(x > 0){
            this.lx = 0;
            unmoving = false;
        } else if(x < 0){
            this.lx = 600;
            unmoving = false;
        }
        if(y > 0){
            this.ly = 0;
            unmoving = false;
        } else if(y < 0){
            this.ly = 600;
            unmoving = false;
        }
        if(s1 != this.x && !this.onPlat){
            if(this.camx){
                ctx.translate(-x, 0);
                offX += x;
                if(offX != this.x - this.sx && !unmoving){
                    offX = this.x - this.sx;
                    ctx.translate(x, 0);
                    unmoving = true;
                    //return;
                } else{
                    unmoving = false;
                }
                if(unmoving){
                    unmoving = false;
                }
            }
        }
        if(s2 != this.y && !this.onPlat){
            if(this.camy){
                ctx.translate(0, -y);
                offY += y;
                if(offY != this.y - this.sy && !unmoving){
                    offY = this.y - this.sy;
                    ctx.translate(0, y);
                    unmoving = true;
                    //return;
                } else{
                    unmoving = false;
                }
                if(unmoving){
                    unmoving = false;
                }
            }
        }
    }
    this.bounce = function(x, y){
        let nx = -x;
        let ny = -y;
        let n = [nx, ny];
        return n;
    }
    this.bounceR = function(x, y, r){
        let nx = -x + Math.random() * r - (r / 1.9);
        let ny = -y + Math.random() * r - (r / 1.9);
        let n = [nx, ny];
        return n;
    }
    this.collidesWith = function(body){
    	if(this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h || this.x + this.w >= body.x && this.x + this.w <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h){
    		return true;
    	} else if(this.x >= body.x && this.x <= body.x + body.w && this.y >= body.y && this.y <= body.y + body.h || this.x >= body.x && this.x <= body.x + body.w && this.y + this.h >= body.y && this.y + this.h <= body.y + body.h){
    		return true;
    	} else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y > this.y && body.y + body.h < this.y + this.h){
    		return true;
    	} else if(body.x < this.x + this.w && body.x + body.w > this.x + this.w && body.y > this.y && body.y + body.h < this.y + this.h){
    		return true;
    	} else if(body.x > this.x && body.x + body.w < this.x + this.w && body.y < this.y && body.y + body.h > this.y){
    		return true;
    	} else if(this.x < body.x && this.x + this.w > body.x + body.w && this.y + this.h > body.y && this.y + this.h < body.y + body.h){
    		return true;
    	} else{
    		return false;
    	}
    }
}

//Testing only
function raycast(x, y, tx, ty, obs){
    let cast = new Character("", x, y, 1, 1);
    let collided = false;
    let cx;
    let cy;
    for(i = 0; i > -1; i++){
        cast.move(x - tx / 20, y - ty / 20);
        for(e = 0; i < obs.length; e++){
            if(cast.collidesWith(obs[e])){
               collided = true
               cx = cast.x;
               cy = cast.y;
               let ret = [collided, cx, cy];
               return ret;
            }
        }
    }
}

function Sprite(src, x, y, w, h){
    this.img = new Image();
    this.img.src = src;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.draw = function(){
        ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
    }
}

function playSound(src){
    let sound = new Audio();
    sound.src = src;
    sound.play();
}
