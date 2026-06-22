import base64
def b64(p): return base64.b64encode(open(p,"rb").read()).decode()
banner = b64("letter_out/banner_clean.png")
wm = b64("letter_out/img_5.jpeg")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SENTHIL MANOGARAN - Karisakattupoove Enterprises</title>
<style>
  * {{ box-sizing:border-box; margin:0; padding:0; }}
  body {{ background:#e6e6e6; font-family:Arial,Helvetica,sans-serif; }}
  .page {{ position:relative; width:210mm; min-height:297mm; margin:12px auto; background:#fff;
          box-shadow:0 0 10px rgba(0,0,0,.25); overflow:hidden; }}
  .banner {{ position:relative; width:100%; container-type:inline-size; line-height:0; }}
  .banner img {{ width:100%; display:block; }}
  .owner-name {{ position:absolute; left:17.9%; top:11.8%; color:#ff0000; font-weight:700;
                font-size:2.72cqw; letter-spacing:.3px; white-space:nowrap; }}
  .address {{ position:absolute; left:63.7%; top:74%; color:#0070b9; font-weight:700;
             font-size:1.55cqw; line-height:1.85cqw; white-space:nowrap; }}
  .watermark {{ position:absolute; left:50%; top:58%; transform:translate(-50%,-50%);
               width:95mm; opacity:.55; z-index:0; pointer-events:none; }}
  .content {{ position:relative; z-index:1; padding:8mm 18mm 18mm 18mm; }}
  .date {{ text-align:right; font-size:12pt; margin:2mm 2mm 8mm 0; }}
  .date u {{ padding:0 14px; }}
  .letter-body {{ font-family:'Times New Roman',serif; font-size:12pt; line-height:1.8; color:#111; }}
  .letter-body .title {{ text-align:center; text-decoration:underline; font-size:17pt; font-weight:bold; margin-bottom:16px; }}
  .letter-body p {{ margin:0 0 12px 0; }}
  .blank {{ display:inline-block; min-width:160px; border-bottom:1px solid #333; }}
  .sig {{ display:flex; justify-content:space-between; margin-top:46px; align-items:flex-end; }}
  .stamp {{ width:160px; height:100px; border:2px dashed #777; display:flex; align-items:center;
           justify-content:center; color:#777; }}
  @media print {{ body{{background:#fff;}} @page{{size:A4;margin:0;}} .page{{margin:0;box-shadow:none;}} }}
</style>
</head>
<body>
  <div class="page">
    <div class="banner">
      <img src="data:image/png;base64,{banner}" alt="Karisakattupoove Enterprises">
      <div class="owner-name">SENTHIL MANOGARAN</div>
      <div class="address">
        5/742, Balaji Nagar, Hosur,<br>
        Krishnagiri District - 635126
      </div>
    </div>

    <img class="watermark" src="data:image/jpeg;base64,{wm}" alt="">

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
        accept agreements and complete all onboarding formalities on behalf of the Company.</p>
        <p>This authorization shall remain valid until revoked by the Company through written communication.</p>
        <p>Thanking You.</p>
        <div class="sig">
          <div>
            <b>For Karisakattupoove Enterprises</b><br><br><br>
            ____________________<br>
            Authorized Signatory<br>
            Name: SENTHIL MANOGARAN<br>
            Designation: Proprietor
          </div>
          <div class="stamp">Company Seal</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
"""
open("Karisakattupoove-letterhead.html","w",encoding="utf-8").write(html)
print("wrote Karisakattupoove-letterhead.html (%d KB)" % (len(html)//1024))
