Use the Blender MCP (call get_addon_status first). Goal: renders of my real car for the Salt Road Cinema website, "Save the Subi" page.

Car: 2003 Subaru Impreza WRX sedan, GD chassis, "bugeye" (round headlights, 2001-2003). Real length 4.41 m.

1. search_assets on sketchfab for a 2001-2003 Impreza WRX / bugeye sedan. Show me previews. Only use a downloadable model with a CC0 or CC-BY licence, and write down the author + licence (we credit it on the site). Avoid wagons, hatchbacks and later blobeye/hawkeye fronts unless nothing else exists. Free libraries only, do NOT use generate_3d or any paid generator.
2. import_asset with target_size 4.41, put it on the ground, check it with look.
3. Paint: World Rally Blue mica for now (about #1d3f9a, metallic, clearcoat). I will send photos of the real car later to match colour, wheels and damage.
4. Studio: dark floor (near black, slightly glossy so the car reflects), soft key light from above, rim light so the roofline glows. Cycles, denoised.
5. Render these, PNG:
   - side-left.png: exact left side, orthographic camera, transparent background (film transparent), 2400x900, car fills ~90% of width. Used as a sticker map, so no perspective.
   - hero-34-front.png: front three-quarter, low camera (~0.6 m), 50 mm, dark studio, 2400x1350.
   - hero-34-rear.png: rear three-quarter, same setup, 2400x1350.
6. Save the .blend and the PNGs to ~/Desktop/salt-road-cinema-renders/ and tell me the model name, author and licence.

Then I'll AirDrop the folder back to the other Mac.
