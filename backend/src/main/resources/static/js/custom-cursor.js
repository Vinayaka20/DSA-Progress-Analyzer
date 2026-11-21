
(() => {
    const initializeCursor = () => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
        if (document.querySelector(".custom-cursor")) return;

        const cursor = document.createElement("div");
        cursor.className = "custom-cursor cursor-vortex";

        cursor.innerHTML = `
            <div class="vortex-glow"></div>
            <div class="vortex-core"></div>
            <div class="vortex-ring ring-one"></div>
            <div class="vortex-ring ring-two"></div>
            <div class="vortex-ring ring-three"></div>
            <div class="vortex-sparks">
                <span></span><span></span><span></span>
                <span></span><span></span><span></span>
            </div>
        `;

        document.body.appendChild(cursor);
        document.body.classList.add("custom-cursor-enabled");

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let hasMoved = false;

        document.addEventListener("mousemove", event => {
            mouseX = event.clientX;
            mouseY = event.clientY;

            if (!hasMoved) {
                cursorX = mouseX;
                cursorY = mouseY;
                hasMoved = true;
                cursor.classList.add("visible");
            }
        });

        function animate() {
            if (hasMoved) {
                cursorX += (mouseX - cursorX) * 0.24;
                cursorY += (mouseY - cursorY) * 0.24;

                cursor.style.left = `${cursorX}px`;
                cursor.style.top = `${cursorY}px`;
            }

            requestAnimationFrame(animate);
        }

        document.addEventListener("mouseover", event => {
            if (!(event.target instanceof Element)) return;

            cursor.classList.toggle(
                "is-hovering",
                Boolean(event.target.closest(
                    "button, a, input, select, textarea, [role='button']"
                ))
            );
        });

        document.addEventListener("mousedown", () => {
            cursor.classList.add("is-clicking");
        });

        document.addEventListener("mouseup", () => {
            cursor.classList.remove("is-clicking");
        });

        animate();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeCursor);
    } else {
        initializeCursor();
    }
})();
