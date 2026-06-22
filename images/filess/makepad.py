import base64
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
logo = b64("letter_out/logo-full.png")
wm = b64("letter_out/mid-tree-light.png")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Karisakattu Poove Trust - Letter Pad</title>
<style>
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ background:#e9e9e9; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#222; }}
  .page {{ position:relative; width:210mm; min-height:297mm; margin:14px auto; background:#fff;
          box-shadow:0 2px 14px rgba(0,0,0,.18); overflow:hidden; display:flex; flex-direction:column; }}

  .header {{ position:relative; margin:8mm 8mm 0; border:3px solid #cfa83a; border-radius:10px;
            background:linear-gradient(135deg,#fffef4 0%,#fbf6e0 45%,#f1f8e6 100%);
            padding:10px 22px 14px; overflow:hidden; }}
  .ribbon {{ position:absolute; left:0; right:0; top:0; height:6px;
            background:linear-gradient(90deg,#e23b3b 0%,#f0a91e 33%,#3fae3f 66%,#1f8ad0 100%); }}
  .hrow {{ display:flex; justify-content:space-between; align-items:flex-start; margin-top:8px; }}
  .name {{ color:#e11d1d; font-weight:800; font-size:15pt; letter-spacing:.4px; }}
  .name small {{ display:block; color:#8a7a3a; font-weight:600; font-size:9.5pt; letter-spacing:1px; }}
  .phone {{ color:#e11d1d; font-weight:800; font-size:12.5pt; text-align:right; line-height:1.4; }}
  .brandc {{ text-align:center; margin:4px 0 6px; white-space:nowrap; }}
  .brandc img {{ height:66px; width:auto; vertical-align:middle; display:inline-block; }}
  .brandc .trust {{ display:inline-block; vertical-align:middle; font-size:24pt; font-weight:800;
                   letter-spacing:5px; color:#2e8b2e; margin-left:10px; }}
  .tagline {{ text-align:center; font-size:10pt; letter-spacing:2px; color:#5a8a39;
             text-transform:uppercase; font-weight:600; margin-bottom:8px; }}
  .divider {{ height:2px; background:linear-gradient(90deg,transparent,#cfa83a 20%,#cfa83a 80%,transparent); margin:6px 0 10px; }}
  .crow {{ display:flex; justify-content:space-between; align-items:flex-start;
          color:#0a66b0; font-weight:700; font-size:11pt; }}
  .crow .addr {{ text-align:right; line-height:1.4; }}

  .watermark {{ position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
               width:135mm; opacity:.9; z-index:0; pointer-events:none; }}

  /* blank writing area */
  .content {{ position:relative; z-index:1; flex:1 0 auto; padding:12mm 16mm 10mm 16mm; }}

  .footer {{ margin-top:auto; }}
  .footer .txt {{ text-align:center; font-size:9.5pt; letter-spacing:.5px; color:#7a877d; padding:7px 0; }}
  .footer .txt b {{ color:#2e8b2e; }}
  .footer .bar {{ height:6px; background:linear-gradient(90deg,#1f8ad0 0%,#3fae3f 34%,#f0a91e 67%,#e23b3b 100%); }}

  @media print {{ body{{background:#fff;}} @page{{size:A4;margin:8mm;}}
    .page{{margin:0;box-shadow:none;width:auto;min-height:auto;}}
    .footer{{position:fixed;left:0;right:0;bottom:0;}}
    .watermark{{position:fixed;top:50%;left:50%;}} }}
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="ribbon"></div>
      <div class="hrow">
        <div class="name">SENTHIL MANOGARAN<small>FOUNDER / PRESIDENT</small></div>
        <div class="phone">Phone: +91 96292 80506<br>+91 77088 55337</div>
      </div>
      <div class="brandc">
        <img src="data:image/png;base64,{logo}" alt="Karisakattu Poove"><span class="trust">TRUST</span>
      </div>
      <div class="tagline">Environmental &amp; Social Trust &nbsp;&middot;&nbsp; Hosur, Tamil Nadu</div>
      <div class="divider"></div>
      <div class="crow">
        <div class="mail">karisakattupoovetn@gmail.com</div>
        <div class="addr">5/742, Balaji Nagar, Hosur,<br>Krishnagiri District &ndash; 635126</div>
      </div>
    </div>

    <img class="watermark" src="data:image/png;base64,{wm}" alt="">

    <div class="content"><!-- blank letter pad: write your content here --></div>

    <div class="footer">
      <div class="txt"><b>Karisakattu Poove Trust</b> &nbsp;&middot;&nbsp; www.karisakattupoovetrust.org &nbsp;&middot;&nbsp; Hosur, Tamil Nadu</div>
      <div class="bar"></div>
    </div>
  </div>
</body>
</html>
"""
open("Karisakattupoove-letterpad.html","w",encoding="utf-8").write(html)
print("wrote Karisakattupoove-letterpad.html (%d KB)" % (len(html)//1024))
