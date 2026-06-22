from PIL import Image
im = Image.open("letter_out/img_8.png").convert("RGBA")
px = im.load(); W,H = im.size
# Crop the central green leaf branch (top) and key out white/cream -> transparent
def keyout(crop):
    c = crop.copy(); p = c.load(); w,h = c.size
    for x in range(w):
        for y in range(h):
            r,g,b,a = p[x,y]
            # whitish / cream / pale yellow -> transparent
            if r>225 and g>222 and b>205 and abs(r-g)<35:
                p[x,y]=(r,g,b,0)
            elif r>235 and g>235 and b>235:
                p[x,y]=(r,g,b,0)
    return c
branch = keyout(im.crop((360,15,710,210)))
branch.save("letter_out/leaf_branch.png")
cluster = keyout(im.crop((340,250,600,373)))
cluster.save("letter_out/leaf_cluster.png")
print("saved leaf_branch.png", branch.size, "leaf_cluster.png", cluster.size)
