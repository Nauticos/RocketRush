import kaplay from "kaplay";

kaplay();

loadSprite("rocket", "sprites/rocket.png");
loadSprite("space-bg", "sprites/space.png");

const bg1 = add([
    sprite("space-bg", { width: width(), height: height() }),
    pos(0, 0),
]);
const bg2 = add([
    sprite("space-bg", { width: width(), height: height() }),
    pos(width(), 0),
]);

function addRocket(x, y) {
    return add([
        sprite("rocket", {
            width: 128,
            height: 128,
        }),
        pos(x, y),
        rotate(45),         
        area(),          
    ]);
}

const rocket = addRocket(200, 250);
const speedText = add([
    text("Hold SPACE for Hyperdrive", { size: 28 }),
    pos(20, 20),
]);

let rocketSpeed = 4;   
let movingDown = true;
let hyperDrive = false;
let scrollSpeed = 2;
let spaceHeldTime = 0;

onUpdate(() => {
    if (hyperDrive === true) {
        scrollSpeed = 12;
        speedText.text = "HYPERDRIVE ON! 🚀";
        speedText.color = rgb(255, 50, 50);
    } else {
        scrollSpeed = 2;
        speedText.text = "Hold SPACE for Hyperdrive";
        speedText.color = rgb(255, 255, 255); 
    }

    if (isKeyDown("space")) {
        spaceHeldTime += dt(); 
        
        if (spaceHeldTime >= 0.5) {
            hyperDrive = true;
        }
    } else {
        spaceHeldTime = 0;
        hyperDrive = false;
    }

    bg1.pos.x -= scrollSpeed;
    bg2.pos.x -= scrollSpeed;

    if (bg1.pos.x <= -width()) {
        bg1.pos.x = bg2.pos.x + width();
    }
    if (bg2.pos.x <= -width()) {
        bg2.pos.x = bg1.pos.x + width();
    }

    if (movingDown === true) {
        rocket.pos.y += rocketSpeed; 
    } else {
        rocket.pos.y -= rocketSpeed; 
    }

    if (rocket.pos.y > 550) {
        rocket.pos.y = 550;
    }
    if (rocket.pos.y < 50) {
        rocket.pos.y = 50;
    }
});

onKeyPress("space", () => {
    movingDown = !movingDown;
});