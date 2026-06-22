from PIL import Image
import math
im = Image.open("letter_out/mid-tree.png").convert("RGB")
W,H = im.size
white = Image.new("RGB",(W,H),(255,255,255))
# pale: keep only ~16% of original over white -> very light
pale = Image.blend(white, im, 0.16).convert("RGBA")
# radial alpha mask: solid in center, fade to 0 at edges (soft, no rectangle)
px = pale.load()
cx, cy = W/2, H/2
maxd = math.hypot(cx, cy)
for y in range(H):
    for x in range(W):
        d = math.hypot(x-cx, y-cy)/maxd       # 0 center .. 1 corner
        if d < 0.55: a = 255
        elif d > 0.95: a = 0
        else: a = int(255 * (0.95 - d) / (0.95 - 0.55))
        r,g,b,_ = px[x,y]
        px[x,y] = (r,g,b,a)
pale.save("letter_out/mid-tree-light.png")
print("saved mid-tree-light.png", pale.size)
