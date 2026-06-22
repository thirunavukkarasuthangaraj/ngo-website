import base64
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
logo = b64("letter_out/logo-full.png")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Karisakattu Poove Trust - Letterhead</title>
<style>
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ background:#e9e9e9; font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif; color:#1f2a24; }}
  .page {{ position:relative; width:210mm; min-height:297mm; margin:14px auto; background:#fff;
          box-shadow:0 2px 14px rgba(0,0,0,.18); overflow:hidden; }}

  /* top accent bar */
  .topbar {{ height:7px; background:linear-gradient(90deg,#3c8a2e 0%,#8cc63f 55%,#e6c12e 100%); }}

  /* header */
  .header {{ display:flex; justify-content:space-between; align-items:flex-start;
            padding:18mm 16mm 6mm 16mm; }}
  .brand {{ display:flex; flex-direction:column; align-items:flex-start; gap:8px; }}
  .logo-pill {{ display:inline-flex; align-items:center; gap:10px;
               background:#fff; border:1px solid #e7eede; border-radius:60px;
               padding:7px 20px 7px 12px; box-shadow:0 4px 16px rgba(60,120,40,.14); }}
  .logo-pill img {{ height:50px; width:auto; display:block; }}
  .logo-pill .trust {{ font-size:19px; font-weight:800; letter-spacing:3px; color:#3c8a2e; }}
  .tagline {{ font-size:10.5px; letter-spacing:1.5px; color:#7a877d; text-transform:uppercase;
             padding-left:6px; }}

  .contact {{ text-align:right; line-height:1.5; }}
  .contact .who {{ font-size:14px; font-weight:700; color:#1f2a24; }}
  .contact .role {{ font-size:11px; color:#8a968d; letter-spacing:.5px; margin-bottom:6px; }}
  .contact .line {{ font-size:12px; color:#55625a; }}
  .contact .mail {{ font-size:12px; color:#3c8a2e; font-weight:600; }}

  .rule {{ height:2px; margin:0 16mm; background:linear-gradient(90deg,#3c8a2e,#cfe6b5 70%,transparent); }}

  /* watermark */
  .watermark {{ position:absolute; left:50%; top:58%; transform:translate(-50%,-50%);
               width:120mm; opacity:.06; z-index:0; pointer-events:none; }}

  /* body */
  .content {{ position:relative; z-index:1; padding:10mm 16mm 18mm 16mm; }}
  .date {{ text-align:right; font-size:12pt; margin:0 0 10mm 0; font-family:'Times New Roman',serif; }}
  .date u {{ padding:0 14px; }}
  .letter-body {{ font-family:'Times New Roman',serif; font-size:12pt; line-height:1.8; color:#161616; }}
  .letter-body .title {{ text-align:center; text-decoration:underline; font-size:16pt; font-weight:bold; margin-bottom:16px; }}
  .letter-body p {{ margin:0 0 12px 0; }}
  .blank {{ display:inline-block; min-width:160px; border-bottom:1px solid #333; }}
  .sig {{ margin-top:46px; }}

  /* footer */
  .footer {{ position:absolute; left:0; right:0; bottom:0; height:auto; }}
  .footer .bar {{ height:6px; background:linear-gradient(90deg,#e6c12e 0%,#8cc63f 45%,#3c8a2e 100%); }}
  .footer .txt {{ text-align:center; font-size:10px; letter-spacing:.6px; color:#7a877d;
                 padding:6px 0 8px; }}
  .footer .txt b {{ color:#3c8a2e; }}

  @media print {{ body{{background:#fff;}} @page{{size:A4;margin:0;}} .page{{margin:0;box-shadow:none;}} }}
</style>
</head>
<body>
  <div class="page">
    <div class="topbar"></div>

    <div class="header">
      <div class="brand">
        <span class="logo-pill">
          <img src="data:image/png;base64,{logo}" alt="Karisakattu Poove">
          <span class="trust">TRUST</span>
        </span>
        <span class="tagline">Environmental &amp; Social Trust &nbsp;&middot;&nbsp; Hosur, Tamil Nadu</span>
      </div>
      <div class="contact">
        <div class="who">SENTHIL MANOGARAN</div>
        <div class="role">Trustee</div>
        <div class="line">+91 96292 80506 &nbsp;&middot;&nbsp; +91 77088 55337</div>
        <div class="mail">karisakattupoovetn@gmail.com</div>
        <div class="line">5/742, Balaji Nagar, Hosur, Krishnagiri District &ndash; 635126</div>
      </div>
    </div>
    <div class="rule"></div>

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
          <b>For Karisakattu Poove Trust</b><br><br><br>
          ____________________<br>
          Authorized Signatory<br>
          Name: SENTHIL MANOGARAN<br>
          Designation: Trustee
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="txt"><b>Karisakattu Poove Trust</b> &nbsp;&middot;&nbsp; www.karisakattupoovetrust.org &nbsp;&middot;&nbsp; Hosur, Tamil Nadu</div>
      <div class="bar"></div>
    </div>
  </div>
</body>
</html>
"""
open("Karisakattupoove-letterhead.html","w",encoding="utf-8").write(html)
print("wrote (%d KB)" % (len(html)//1024))
