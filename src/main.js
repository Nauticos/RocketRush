import kaplay from "kaplay";

kaplay();
debug.inspect = false;

loadSprite("rocket", "sprites/rocket.png");
loadSprite("space-bg", "sprites/space.png");
loadSprite("start-bg", "sprites/startbg.png");
loadSprite("victory-bg", "sprites/victorybg.png");
loadSprite("asteroid1", "sprites/asteroid1.png");
loadSprite("asteroid2", "sprites/asteroid2.png");
loadSprite("asteroid3", "sprites/asteroid3.png");
loadSprite("asteroid4", "sprites/asteroid4.png");
loadSprite("galaxy1", "sprites/galaxy1.png");
loadSprite("galaxy2", "sprites/galaxy2.png");
loadSprite("galaxy3", "sprites/galaxy3.png");

scene("start", () => {
    add([
        sprite("start-bg", { width: width(), height: height() }),
        pos(0, 0),
    ]);

    add([
        text("ROCKET RUSH", { size: 64 }),
        pos(width() / 2, height() / 2 - 80),
        color(255, 215, 0),
        anchor("center"),
    ]);

    const startButton = add([
        rect(240, 60, { radius: 8 }),
        pos(width() / 2, height() / 2 + 40),
        color(255, 255, 255),
        anchor("center"),
        area(),
    ]);

    add([
        text("START", { size: 20 }),
        pos(width() / 2, height() / 2 + 40),
        color(0, 0, 0),
        anchor("center"),
    ]);

    add([
        text("Press SPACE to toggle direction\nHold SPACE to activate hyperdrive", { size: 16, align: "center" }),
        pos(width() / 2, height() / 2 + 140),
        color(180, 180, 180),
        anchor("center"),
    ]);

    startButton.onClick(() => {
        go("game");
    });
});

scene("game", () => {
    const SHAKE_PADDING = 200;

    const VERTICAL_MARGIN = 64; 
    const MIN_Y = VERTICAL_MARGIN;
    const MAX_Y = height() - VERTICAL_MARGIN;

    const bg1 = add([
        sprite("space-bg", {
            width: width() + SHAKE_PADDING,
            height: height() + SHAKE_PADDING,
        }),
        pos(0, -SHAKE_PADDING / 2),
    ]);
    
    const bg2 = add([
        sprite("space-bg", {
            width: width() + SHAKE_PADDING,
            height: height() + SHAKE_PADDING
        }),
        pos(width() + SHAKE_PADDING, -SHAKE_PADDING / 2),
    ]);

    const gal1 = add([
        sprite(choose(["galaxy1", "galaxy2", "galaxy3"]), {
            width: width() + SHAKE_PADDING,
            height: height() + SHAKE_PADDING,
        }),
        pos(0, -SHAKE_PADDING / 2),
        opacity(0.4),
    ]);

    const gal2 = add([
        sprite(choose(["galaxy1", "galaxy2", "galaxy3"]), {
            width: width() + SHAKE_PADDING,
            height: height() + SHAKE_PADDING,
        }),
        pos(width() + SHAKE_PADDING, -SHAKE_PADDING / 2),
        opacity(0.4),
    ]);

    function addRocket(x, y) {
        return add([
            sprite("rocket", {
                width: 128,
                height: 128,
            }),
            pos(x, y),
            anchor("center"),
            area({
                shape: new Rect(vec2(0), 128, 128),
                scale: vec2(0.9, 0.5),
            }),          
        ]);
    }

    const rocket = addRocket(200, height() / 2);
    
    const speedText = add([
        text("Hold SPACE for Hyperdrive", { size: 28 }),
        pos(20, 20),
    ]);

    const timerText = add([
        text("Time: 60s", { size: 28 }),
        color(255, 255, 0),
        pos(40, height() - 60),
        fixed(), 
    ]);

    let rocketSpeed = 4;   
    let movingDown = true;
    let hyperDrive = false;
    let scrollSpeed = 4;
    let spaceHeldTime = 0;
    let timeLeft = 60;
    let spawnTimer = 0;
    let spawnInterval = 2.0;

    function spawnAsteroid() {
        const asteroidSize = Math.random() * 128 + 64;
        const randomSprite = choose(["asteroid1", "asteroid2", "asteroid3", "asteroid4"]);
        const randomY = rand(MIN_Y, MAX_Y);
        const spinSpeed = rand(-150, 150);
        
        const asteroid = add([
            sprite(randomSprite, {
                width: asteroidSize,
                height: asteroidSize
            }),
            pos(width() + 50, randomY),
            anchor("center"),
            rotate(0),
            area({
                shape: new Rect(vec2(0), asteroidSize, asteroidSize),
                scale: vec2(0.75, 0.75),
            }),
            "obstacle",
        ]);

        let nearMissTriggered = false;

        asteroid.onUpdate(() => {
            asteroid.pos.x -= scrollSpeed;
            asteroid.angle += spinSpeed * dt();

            if (asteroid.pos.x < -100) {
                destroy(asteroid);
                return;
            }

            if (rocket.exists() && !nearMissTriggered) {
                const distX = Math.abs(rocket.pos.x - asteroid.pos.x);
                const distY = Math.abs(rocket.pos.y - asteroid.pos.y);

                if (distX > 40 && distX < 90 && distY > 65 && distY < 110) {
                    nearMissTriggered = true;
                    
                    wait(0.1, () => {
                        if (!rocket.exists()) return;

                        shake(4);
                        
                        const flashText = add([
                            text("NEAR MISS!", { size: 20 }),
                            pos(rocket.pos.x, rocket.pos.y - 60),
                            color(255, 255, 0),
                            anchor("center"),
                        ]);
                        
                        flashText.onUpdate(() => {
                            flashText.pos.y -= 60 * dt();
                        });
                        
                        wait(0.8, () => destroy(flashText));
                    });
                }
            }
        });
    }

    onUpdate(() => {
        if (hyperDrive === true) {
            scrollSpeed = 12;
            speedText.text = "HYPERDRIVE ON! 🚀";
            speedText.color = rgb(255, 50, 50);
        } else {
            scrollSpeed = 4;
            speedText.text = "Hold SPACE for Hyperdrive";
            speedText.color = rgb(0, 255, 0); 
        }

        if (isKeyDown("space")) {
            spaceHeldTime += dt(); 
            if (spaceHeldTime >= 1) {
                hyperDrive = true;
            }
        } else {
            spaceHeldTime = 0;
            hyperDrive = false;
        }

        bg1.pos.x -= scrollSpeed;
        bg2.pos.x -= scrollSpeed;

        if (bg1.pos.x <= -(width() + SHAKE_PADDING)) {
            bg1.pos.x = bg2.pos.x + (width() + SHAKE_PADDING) - 4;
        }

        if (bg2.pos.x <= -(width() + SHAKE_PADDING)) {
            bg2.pos.x = bg1.pos.x + (width() + SHAKE_PADDING) - 4;
        }

        if (movingDown === true) {
            rocket.pos.y += rocketSpeed; 
        } else {
            rocket.pos.y -= rocketSpeed; 
        }

        if (rocket.pos.y > MAX_Y) {
            rocket.pos.y = MAX_Y;
        }
        if (rocket.pos.y < MIN_Y) {
            rocket.pos.y = MIN_Y;
        }

        if (rocket.exists()) {
            timeLeft -= dt();
            timerText.text = "Time to touchdown: " + Math.ceil(timeLeft) + "s";
            
            spawnInterval = 0.5 + (timeLeft / 60) * 1.5;
            spawnTimer += dt();
            
            if (spawnTimer >= spawnInterval) {
                spawnAsteroid();
                spawnTimer = 0;
            }
        }

        gal1.pos.x -= scrollSpeed * 0.3;
        gal2.pos.x -= scrollSpeed * 0.3;

        if (gal1.pos.x <= -(width() + SHAKE_PADDING)) {
            gal1.pos.x = gal2.pos.x + (width() + SHAKE_PADDING) - 4;
            
            gal1.use(sprite(choose(["galaxy1", "galaxy2", "galaxy3"]), {
                width: width() + SHAKE_PADDING,
                height: height() + SHAKE_PADDING,
            }));
        }

        if (gal2.pos.x <= -(width() + SHAKE_PADDING)) {
            gal2.pos.x = gal1.pos.x + (width() + SHAKE_PADDING) - 4;
            
            gal2.use(sprite(choose(["galaxy1", "galaxy2", "galaxy3"]), {
                width: width() + SHAKE_PADDING,
                height: height() + SHAKE_PADDING,
            }));
        }

        if (timeLeft <= 0) {
            go("victory"); 
        }
    });

    onKeyPress("space", () => {
        movingDown = !movingDown;
    });

    rocket.onCollide("obstacle", (asteroid) => {
        shake(12);
        destroy(rocket);
        
        add([
            text("GAME OVER", { size: 48 }),
            pos(width() / 2, height() / 2 - 30),
            anchor("center"),
        ]);

        const resetButton = add([
            rect(200, 60, { radius: 8 }),
            pos(width() / 2, height() / 2 + 50),
            color(255, 255, 255),
            anchor("center"),
            area(),
        ]);

        add([
            text("RESTART", { size: 24 }),
            pos(width() / 2, height() / 2 + 50),
            color(0, 0, 0),
            anchor("center"),
        ]);

        resetButton.onClick(() => {
            go("game");
        });
    });
});

scene("victory", () => {
    add([
        sprite("victory-bg", { width: width(), height: height() }),
        pos(0, 0),
    ]);

    add([
        text("MISSION ACCOMPLISHED!", { size: 48 }),
        pos(width() / 2, height() / 2 - 80),
        color(0, 255, 128),
        anchor("center"),
    ]);

    add([
        text("You made it to the moon!", { size: 20 }),
        pos(width() / 2, height() / 2 - 20),
        color(200, 200, 200),
        anchor("center"),
    ]);

    const playAgainButton = add([
        rect(240, 60, { radius: 8 }),
        pos(width() / 2, height() / 2 + 60),
        color(255, 255, 255),
        anchor("center"),
        area(),
    ]);

    add([
        text("PLAY AGAIN?", { size: 22 }),
        pos(width() / 2, height() / 2 + 60),
        color(0, 0, 0), 
        anchor("center"),
    ]);

    playAgainButton.onClick(() => {
        go("game");
    });
});

go("start");