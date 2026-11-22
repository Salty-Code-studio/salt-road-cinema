Use the Blender MCP. Open ~/Desktop/salt-road-cinema-renders/save-the-subi-scan.blend (the photo-scan Subi).

Render a 360° turntable for the website's garage, transparent background:
1. Keep the car centred at the origin, wheels on the ground. Add an empty at the origin and parent the camera to it (or rotate the car itself).
2. Camera: orthographic or 50 mm, at car-door height (~0.9 m), looking level at the car, framed so the car fills ~85% of the width at its longest view. Same framing for every frame.
3. Lighting: soft top light + gentle rim, no floor (Film > Transparent ON).
4. 36 frames, rotating 10° per frame, frame 1 = exact left side (front of car pointing left, like side-left.png), rotating so the front swings towards the camera.
5. Output PNG RGBA, 1600x600, filenames turntable-00.png … turntable-35.png, into ~/Desktop/salt-road-cinema-renders/turntable/.
6. Then compress: convert each to WebP (quality 80, keep alpha) if cwebp is available, else keep PNG.

AirDrop the turntable folder back to the other Mac when done.
