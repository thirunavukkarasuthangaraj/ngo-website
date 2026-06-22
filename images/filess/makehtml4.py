import base64
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
logo = b64("letter_out/logo-full.png")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SENTHIL MANOGARAN - Karisakattupoove Trust</title>
<style>
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ background:#e6e6e6; font-family:Arial,Helvetica,sans-serif; }}
  .page {{ position:relative; width:210mm; min-height:297mm; margin:12px auto; background:#fff;
          box-shadow:0 0 10px rgba(0,0,0,.25); overflow:hidden; }}

  /* ---- Rebuilt header ---- */
  .header {{ position:relative; margin:8mm 8mm 0 8mm; border:3px solid #c19a2e; border-radius:6px;
            background:linear-gradient(180deg,#fffef8 0%,#fdf6e3 100%); padding:10px 18px 12px; }}
  .hrow {{ display:flex; justify-content:space-between; align-items:flex-start; }}
  .owner-name {{ color:#e60000; font-weight:700; font-size:14pt; letter-spacing:.3px; }}
  .phone {{ color:#e60000; font-weight:700; font-size:12pt; text-align:right; line-height:1.35; }}
  .logo-wrap {{ text-align:left; margin:4px 0 8px; white-space:nowrap; }}
  .logo-wrap img {{ width:42%; max-width:370px; height:auto; display:inline-block; vertical-align:middle; }}
  .trust {{ display:inline-block; vertical-align:middle; font-weight:800; font-size:22pt;
           letter-spacing:4px; color:#1b8a3a; margin-left:6px; }}
  .divider {{ height:2px; background:#c19a2e; opacity:.6; margin:0 0 8px; }}
  .contact {{ display:flex; justify-content:space-between; align-items:flex-start;
             color:#0a66b0; font-weight:700; font-size:11pt; }}
  .contact .addr {{ text-align:right; line-height:1.35; }}

  /* ---- Watermark (faint logo) ---- */
  .watermark {{ position:absolute; left:50%; top:56%; transform:translate(-50%,-50%);
               width:130mm; opacity:.07; z-index:0; pointer-events:none; }}

  /* ---- Body ---- */
  .content {{ position:relative; z-index:1; padding:8mm 18mm 18mm 18mm; }}
  .date {{ text-align:right; font-size:12pt; margin:6mm 2mm 8mm 0; }}
  .date u {{ padding:0 14px; }}
  .letter-body {{ font-family:'Times New Roman',serif; font-size:12pt; line-height:1.8; color:#111; }}
  .letter-body .title {{ text-align:center; text-decoration:underline; font-size:17pt; font-weight:bold; margin-bottom:16px; }}
  .letter-body p {{ margin:0 0 12px 0; }}
  .blank {{ display:inline-block; min-width:160px; border-bottom:1px solid #333; }}
  .sig {{ margin-top:46px; }}
  @media print {{ body{{background:#fff;}} @page{{size:A4;margin:0;}} .page{{margin:0;box-shadow:none;}} }}
</style>
</head>
<body>
  <div class="page">

    <div class="header">
      <div class="hrow">
        <div class="owner-name">SENTHIL MANOGARAN</div>
        <div class="phone">Phone: +91 96292 80506<br>+91 77088 55337</div>
      </div>
      <div class="logo-wrap">
        <img src="data:image/png;base64,{logo}" alt="Karisakattupoove"><span class="trust">TRUST</span>
      </div>
      <div class="divider"></div>
      <div class="contact">
        <div class="email">karisakattupoovetn@gmail.com</div>
        <div class="addr">5/742, Balaji Nagar, Hosur,<br>Krishnagiri District - 635126</div>
      </div>
    </div>

    <img class="watermark" src="data:image/png;base64,{logo}" alt="">

    <div class="content">
      <div class="date"><b>Date:</b> <u>&nbsp;&nbsp;&nbsp;&nbsp;</u>/<u>&nbsp;&nbsp;&nbsp;&nbsp;</u>/<u>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</u></div>
      <div class="letter-body">
        <div class="title">POWER OF ATTORNEY / AUTHORIZATION LETTER</div>
        <p>To,<br>The Compliance Team<br>Razorpay Payments Private Limited</p>
        <p><b>Subject:</b> Authorization Letter for Razorpay Merchant Account</p>
        <p>Dear Sir/Madam,</p>
        <p>This is to certify that <b>Mr./Ms.</b> <span class="blank"></span> is hereby authorized by
        <span class="blank"></span> to sign and execute all agreements, undertakings, applications,
        declarations, KYC documents and all necessary documents required for availing and operating the
        services provided by Razorpay Payments Private Limited.</p>
        <p>The above authorized person is also authorized to communicate with Razorpay, submit documents,
        accept agreements and complete all onboarding formalities on behalf of the Trust.</p>
        <p>This authorization shall remain valid until revoked by the Trust through written communication.</p>
        <p>Thanking You.</p>
        <div class="sig">
          <div>
            <b>For Karisakattupoove Trust</b><br><br><br>
            ____________________<br>
            Authorized Signatory<br>
            Name: SENTHIL MANOGARAN<br>
            Designation: Trustee
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
"""
open("Karisakattupoove-letterhead.html","w",encoding="utf-8").write(html)
print("wrote Karisakattupoove-letterhead.html (%d KB)" % (len(html)//1024))
