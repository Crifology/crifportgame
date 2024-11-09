import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
    sliceX: 39, // frames are 16x16 
    sliceY: 31,
    anims: {
        "idle-down": 936,
        "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
        "idle-side": 975,
        "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
        "idle-up": 1014,
        "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
    },
});

// Load Map Image
k.loadSprite("map", "./map.png");

// Load Background Color
k.setBackground(k.Color.fromHex("#311047"));

// Creating the Game Frontend with Player
k.scene("main", async () => {
    const mapData = await (await fetch("./map.json")).json()
    // ... load map data and load as json function

    const layers = mapData.layers;
    // looks cleaner than the map.json layers

    const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

    const player = k.make([
        k.sprite("spritesheet", {anim: "idle-down"}), 
        k.area({
            shape: new k.Rect(k.vec2(0, 3), 10, 10),
        }),
        k.body(),
        k.anchor("center"),
        k.scale(scaleFactor),
        {
            speed: 250,
            direction: "down",
            isInDialogue: false,
        },
        "player", 
    ]);

    // Creating Boundaries
    for (const layer of layers) {
        if (layer.name === "boundaries") {
            for (const boundaries of layer.objects) {
                map.add([
                    k.area({
                        shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
                    }),
                    k.body({ isStatic: true }),
                    k.pos(boundary.x, boundary.y),
                    boundary.name,
                ]);

                // collision checks
                if (boundary.name) {
                    player.onCollide(boundary.name, () => {
                        player.isInDialogue = true;
                        displayDialogue(dialogueData[boundary.name], () => (player.isInDialogue = false))
                    });
                }
            }

            continue;
        }

        if (layer.name === "spawn") {
            for (const entity of layers.objects) {
               if (entity.name === "player") {
                player.pos = k.vec2(
                    (map.pos.x + entity.x) * scaleFactor,
                    (map.pos.y + entity.y) * scaleFactor
                );
                k.add(player);

                continue;
               }
            }
        }
    } 

    // Scaling the Camera
    setCamScale(k)

    k.onResize(() => {
        setCamScale(k);
    })

    k.onUpdate(() => {
        k.camPos(player.pos.x, player.pos.y + 100);
    });

    // Player Movement
    k.onMouseDown((mouseBtn) => {
        if (mouseBtn !== "left" || player.isInDialogue) return;

        const worldMousePos = k.toWorld(k.mousePos());
        player.moveTo(worldMousePos, player.speed);

        const mouseAngle = player.pos.angle(worldMousePos)

        const lowerBound = 50;
        const upperBound = 125;

        if (
            mouseAngle > lowerBound &&
            mouseAngle < upperBound &&
            player.curAnim() !== "walk-up"
        ) {
            player.play("walk-up");
            player.direction = "up";
            return;
        }

        if (
            mouseAngle > -lowerBound &&
            mouseAngle < -upperBound &&
            player.curAnim() !== "walk-down"
        ) {
            player.play("walk-down");
            player.direction = "down";
            return;
        }

        if (Math.abs(mouseAngle) > upperBound) {
            player.flipX = false;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "right";
            return;
        }

        if (Math.abs(mouseAngle) < lowerBound) {
            player.flipX = true;
            if (player.curAnim() !== "walk-side") player.play("walk-side");
            player.direction = "left";
            return;
        }
    });

    // Stop Waking Animation When Mouse Clicked Stop
    k.onMouseRelease(() => {
        if (player.direction === "down") {
            player.play("idle-down");
            return;
        }
        if (player.direction === "up") {
            player.play("idle-up");
            return;
        }

        player.play("idle-side");
    })
});

k.go("main");