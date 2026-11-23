Use the Blender MCP. Open ~/Desktop/salt-road-cinema-renders/save-the-subi-scan.blend (the photo-scan Subi, NOT the v1 model).

Export the car as a web-ready 3D file for the website (three.js / <model-viewer>):
1. Keep only the car mesh (delete floor, lights, cameras, helper objects). Apply all modifiers and transforms (Ctrl+A > All Transforms).
2. Real scale in metres (car ~4.41 m long). Origin at the centre of the car, between the wheels, at ground level (wheels touching Z=0). Front of the car pointing along -Y (Blender front view looks at its nose).
3. Clean up: remove floating scan debris and anything not attached to the car body. If it's above ~200k triangles, add a Decimate modifier (Collapse) to land around 150k triangles, then apply it.
4. Textures: bake/keep a single base-colour texture, resized to 2048x2048 (JPEG). No other maps needed unless they already exist and are clean.
5. File > Export > glTF 2.0: format glTF Binary (.glb), Include: Selected Objects, Apply Modifiers ON, Materials: Export, Images: JPEG, Compression (Draco) ON, level 6.
6. Save as ~/Desktop/salt-road-cinema-renders/subi.glb. Target under 8 MB; if bigger, decimate further or drop the texture to 1536.
7. Tell me the triangle count and file size, and render one quick preview PNG of the exported GLB re-imported, to confirm it looks right.

Then AirDrop subi.glb back to the other Mac.
