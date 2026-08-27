
#set page(
  paper: "a4",
  flipped: true,
  fill: rgb("080C14"),
  margin: (x: 2cm, top: 1.8cm, bottom: 1.8cm)
)

#set text(
  font: ("Space Grotesk", "Vazirmatn"),
  size: 9.5pt,
  fill: rgb("CBD5E1"),
  lang: "fa",
  dir: rtl
)

#let brand-header(section-num, en-title, fa-title) = [
  #align(left)[
    #grid(
      columns: (auto, 1fr),
      gutter: 12pt,
      
      text(font: "Space Grotesk", size: 22pt, weight: "bold", fill: rgb("00F2FE"))[#section-num],
      [
        #text(font: "Space Grotesk", size: 16pt, weight: "bold", fill: rgb("FFFFFF"), tracking: 1.5pt)[#en-title] \
        #v(-4pt)
        #text(font: "Vazirmatn", size: 11pt, weight: "medium", fill: rgb("38BDF8"), dir: rtl)[#fa-title]
      ]
    )
  ]
  #v(2pt)
  #line(length: 100%, stroke: 1.2pt + rgb("0284C7"))
  #v(6pt)
]

#let card(title, content, bg: rgb("0E1524"), border: rgb("1E293B")) = {
  rect(
    width: 100%,
    fill: bg,
    stroke: 1pt + border,
    radius: 6pt,
    inset: 11pt,
    [
      #if title != "" [
        #align(right)[
          #text(font: "Vazirmatn", size: 10.5pt, weight: "bold", fill: rgb("38BDF8"))[#title]
        ]
        #v(3pt)
      ]
      #content
    ]
  )
}

#let en-card(title, content, bg: rgb("0E1524"), border: rgb("1E293B")) = {
  rect(
    width: 100%,
    fill: bg,
    stroke: 1pt + border,
    radius: 6pt,
    inset: 11pt,
    [
      #align(left)[
        #text(font: "Space Grotesk", size: 10.5pt, weight: "bold", fill: rgb("38BDF8"), tracking: 1pt)[#title]
      ]
      #v(3pt)
      #content
    ]
  )
}

// =============================================================================
// PAGE 1: COVER PAGE
// =============================================================================

#align(center + horizon)[
  #v(-1cm)
  #image("hyperd_silicon_chiplet_detailed_master.png", width: 27%)
  
  #v(0.4cm)
  #text(font: "Space Grotesk", size: 36pt, weight: "bold", fill: rgb("FFFFFF"), tracking: 8pt)[
    HYPER#text(fill: rgb("00F2FE"))[D]
  ]
  
  #v(-8pt)
  #text(font: "Space Grotesk", size: 12pt, weight: "medium", fill: rgb("94A3B8"), tracking: 4pt)[
    HIGH-PERFORMANCE COMPUTING & HARDWARE
  ]

  #v(0.4cm)
  #line(length: 35%, stroke: 2pt + rgb("00F2FE"))
  #v(0.4cm)

  #text(font: "Space Grotesk", size: 19pt, weight: "bold", fill: rgb("F8FAFC"), tracking: 2pt)[
    OFFICIAL BRAND BOOK & CORPORATE IDENTITY MANUAL
  ]
  
  #v(4pt)
  #text(font: "Vazirmatn", size: 13pt, weight: "medium", fill: rgb("38BDF8"), dir: rtl)[
    دفترچه جامع استراتژی سازمانی، هویت بصری و استانداردسازی برند هایپرد
  ]

  #v(0.8cm)
  #text(font: "Space Grotesk", size: 9pt, fill: rgb("64748B"), tracking: 1.5pt)[
    VERSION 1.0 • RETAIL & ENTERPRISE SYSTEMS • CONFIDENTIAL
  ]
]

#pagebreak()

// =============================================================================
// PAGE 2: TABLE OF CONTENTS
// =============================================================================

#brand-header("00", "TABLE OF CONTENTS & ARCHITECTURE", "فهرست محتوا و ارکان ساختار برند")

#grid(
  columns: (1.1fr, 1.3fr),
  gutter: 20pt,
  [
    #card("معرفی و رسالت کتابچه برند", [
      این کتابچه جامع (Brand Book)، معتبرترین و رسمی‌ترین سند هویت تجاری فروشگاه و مجموعه مهندسی *Hyperd* است. هدف از تدوین این مجموعه، ایجاد زبانی مشترک و هماهنگ میان تمام ارکان سازمانی—از مهندسان و متخصصان فنی گرفته تا مدیران فروش، کارشناسان بازاریابی و معماران شعب—می‌باشد.

      #v(6pt)
      در دنیای امروز کامپیوتر و فناوری‌های پردازشی، برندهایی ماندگار می‌شوند که علاوه بر قدرت سخت‌افزاری، هویتی منظم، مقتدر، مدرن و قابل اعتماد را به نمایش بگذارند.
    ])

    #v(8pt)
    #rect(
      width: 100%,
      fill: rgb("08101E"),
      stroke: 1pt + rgb("0284C7"),
      radius: 6pt,
      inset: 10pt,
      [
        #align(left)[
          #text(font: "Space Grotesk", size: 9.5pt, weight: "bold", fill: rgb("00F2FE"))[THREE PILLARS OF HYPERD]
        ]
        #v(4pt)
        #align(right)[
          #text(font: "Vazirmatn", size: 8.5pt, fill: rgb("CBD5E1"), dir: rtl)[
            *۱. استراتژی و ارزش‌ها:* چرایی وجود هایپرد، ماموریت، چشم‌انداز و لحن گفتار.\
            *۲. سیستم هویت بصری:* ساختار مهندسی آرم، هندسه چیپلت، رنگ‌ها و تایپوگرافی.\
            *۳. نقاط تماس فیزیکی و محیطی:* معماری شو‌روم، بسته‌بندی، کارت VIP و سیستم پلمب.
          ]
        ]
      ]
    )
  ],
  [
    #rect(
      width: 100%,
      fill: rgb("0E1524"),
      stroke: 1pt + rgb("1E293B"),
      radius: 6pt,
      inset: 12pt,
      [
        #align(left)[
          #text(font: "Space Grotesk", size: 11pt, weight: "bold", fill: rgb("FFFFFF"), tracking: 1pt)[SECTIONS DIRECTORY]
        ]
        #v(6pt)
        #table(
          columns: (auto, 1fr),
          stroke: none,
          row-gutter: 6pt,
          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[01],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*BRAND ESSENCE & STRATEGY* (ماموریت، ارزش‌ها، داستان برند)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[02],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*BRAND PERSONALITY & TONE* (کهن‌الگو، لحن سازمانی، پرسونای مخاطب)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[03],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*LOGO CONCEPT & ANATOMY* (آناتومی ۳ لایه ویفر و چیپلت‌های شناور)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[04],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*LOCKUPS & CLEAR SPACE* (قفل‌های عمودی/افقی، حریم امن و حداقل ابعاد)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[05],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*COLOR ARCHITECTURE* (پالت رسمی، کدهای HEX, RGB, CMYK, Pantone)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[06],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*TYPOGRAPHY MATRIX* (تایپوگرافی انگلیسی Space Grotesk و فارسی وزیرمتن)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[07],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*CO-BRANDING & PARTNERS* (قوانین هم‌نشینی با Intel, AMD, Nvidia, ASUS)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[08],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*UNACCEPTABLE USAGES* (خطاهای ممنوعه و موارد نقض هویت بصری)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[09],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*RETAIL & SIGNAGE* (معماری فروشگاه، تابلوی سه‌بعدی و متریال دکور)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[10],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*PACKAGING & SECURITY* (هاردباکس، کارت فلزی VIP و پلمب هولوگرامی)],

          text(font: "Space Grotesk", weight: "bold", fill: rgb("00F2FE"))[11],
          text(font: "Vazirmatn", size: 9pt, dir: rtl)[*DIGITAL & CUSTODIANSHIP* (حضور دیجیتال، وب‌سایت و تعهدنامه برند)]
        )
      ]
    )
  ]
)

#pagebreak()

// =============================================================================
// PAGE 3: BRAND ESSENCE & STRATEGY
// =============================================================================

#brand-header("01", "BRAND ESSENCE & STRATEGY", "فلسفه پیدایش، ماموریت و ارزش‌های سازمانی")

#grid(
  columns: (1.1fr, 0.9fr),
  gutter: 18pt,
  [
    #card("داستان و فلسفه نامگذاری Hyperd", [
      نام تجاری *Hyperd* برآمده از تقاطع سرعت بی‌پایان پردازش و کالبد فیزیکی سخت‌افزار مدرن است:
      
      #v(4pt)
      • *Hyper (سرعت مافوق صوت و فراروندگی):* نماد گذر از محدودیت‌های سنتی رایانش، دستیابی به بالاترین نرخ فرکانس، بهره‌وری فوق‌العاده در پردازش‌های سنگین هوش مصنوعی، رندرینگ و گیمینگ پرچمدار.\
      • *d (دیجیتال، دستگاه و داده):* اشاره مستقیم به ماهیت فیزیکی قطعات، پایداری دستگاه‌ها، اصالت سیلیکون و امنیت ذخیره‌سازی داده‌های حیاتی مشتریان.

      #v(4pt)
      هایپرد برای پاسخگویی به خلأ بزرگ بازار در ارائه سیستم‌های محاسباتی مهندسی‌شده، اسمبل استاندارد بین‌المللی و گارانتی بی‌قیدوشرط خلق شده است.
    ])

    #v(8pt)
    #grid(
      columns: (1fr, 1fr),
      gutter: 8pt,
      card("مأموریت برند (Mission)", [
        تامین پیشرفته‌ترین و مطمئن‌ترین قطعات سخت‌افزاری اورجینال، ارائه مشاوره‌های بی‌طرفانه مبتنی بر بنچمارک‌های علمی، و اسمبل حرفه‌ای سیستم‌های کامپیوتری با استانداردهای نظامی و صنعتی.
      ]),
      card("چشم‌انداز برند (Vision)", [
        تبدیل شدن به شاخص‌ترین نام تجاری و نخستین انتخاب حرفه‌ای‌ها، سازمان‌ها و گیمرهای منطقه برای خرید و تجهیز ایستگاه‌های کاری و سیستم‌های محاسباتی تا سال ۲۰۳۰.
      ])
    )
  ],
  [
    #rect(
      width: 100%,
      fill: rgb("0E1524"),
      stroke: 1pt + rgb("1E293B"),
      radius: 6pt,
      inset: 12pt,
      [
        #align(left)[
          #text(font: "Space Grotesk", size: 11pt, weight: "bold", fill: rgb("00F2FE"))[CORE VALUES • ارزش‌های بنیادین]
        ]
        #v(6pt)
        #align(right)[
          #text(font: "Vazirmatn", size: 9pt, dir: rtl)[
            *۱. دقت میلی‌متری (Engineering Precision)*\
            در اسمبل هر پیچ، خمیر حرارتی و سیم‌کشی پشت کیس، استاندارد مطلق مهندسی حاکم است.

            #v(4pt)
            *۲. اصالت ۱۰۰٪ بدون سازش (Absolute Authenticity)*\
            حذف واسطه‌های نامعتبر؛ تک‌تک قطعات دارای شماره سریال رهگیری‌پذیر و اصالت فابریک کارخانه هستند.

            #v(4pt)
            *۳. راندمان ماکزیمم (Peak Performance)*\
            کانفیگ اختصاصی متناسب با نوع نرم‌افزار مشتری جهت حذف هرگونه گلوگاه در عملکرد پردازشی.

            #v(4pt)
            *۴. پاسخگویی و پشتیبانی واقعی (Accountability)*\
            خدمات پس از فروش و گارانتی تعویض واقعی، تضمین‌کننده آرامش خاطر کامل خریداران است.
          ]
        ]
      ]
    )
  ]
)

#pagebreak()

// =============================================================================
// PAGE 4: BRAND PERSONALITY & TONE OF VOICE
// =============================================================================

#brand-header("02", "BRAND PERSONALITY & TONE OF VOICE", "کهن‌الگو، شخصیت و راهنمای لحن ارتباطی")

#grid(
  columns: (1fr, 1fr),
  gutter: 18pt,
  [
    #card("کهن‌الگوی برند (Brand Archetype)", [
      هایپرد در ادبیات برندینگ جهانی بر دو آرکتایپ قدرتمند تکیه دارد:

      #v(5pt)
      • *کهن‌الگوی حاکم (The Ruler):* القاکننده قدرت، رهبری بازار، انضباط سازمانی، استانداردهای بدون مسامحه و رسمیت اعتمادساز. مشتری در مواجهه با هایپرد حس می‌کند با یک قدرت مسلط و معتبر طرف است.\
      • *کهن‌الگوی سازنده (The Creator):* مهارت در خلق، اسمبل هنرمندانه سیستم‌های کاستوم، مادینگ اختصاصی و یافتن بهترین ترکیب قطعات برای چالش‌های فنی پیچیده.
    ])

    #v(8pt)
    #card("پرسونای مخاطبان هدف (Target Audience)", [
      #align(right)[
        #text(font: "Vazirmatn", size: 9pt, dir: rtl)[
          *• آفرینندگان محتوا و رندرکاران:* نیازمند کارت‌های گرافیک کوادرو و استودیو، حافظه‌های پایدار و رم‌های فرکانس بالا.\
          *• گیمرهای حرفه‌ای و اورکلاکرها:* به دنبال بالاترین نرخ فریم، خنک‌کننده‌های مایع کاستوم و طراحی چشم‌نواز.\
          *• شرکت‌ها و دیتاسنترها:* متقاضیان سرورهای ورک‌استیشن، فاکتورهای رسمی و پشتیبانی حضوری ۲۴ ساعته.
        ]
      ]
    ])
  ],
  [
    #card("دستورالعمل لحن گفتار سازمانی (Tone of Voice Matrix)", [
      لحن رسمی هایپرد در تمامی رسانه‌ها باید واجد ویژگی‌های زیر باشد:

      #v(6pt)
      #table(
        columns: (1.1fr, 0.9fr),
        stroke: 0.5pt + rgb("1E293B"),
        fill: (x, y) => if y == 0 { rgb("1E293B") } else { none },
        align: (right, center),
        text(font: "Vazirmatn", weight: "bold", fill: rgb("38BDF8"))[ستون لحن],
        text(font: "Vazirmatn", weight: "bold", fill: rgb("38BDF8"))[نحوه تجلی],

        text(font: "Vazirmatn", size: 8.5pt)[*تخصصی و مستند*],
        text(font: "Vazirmatn", size: 8pt)[استناد به بنچمارک‌های عددی معتبر],

        text(font: "Vazirmatn", size: 8.5pt)[*رسمی، باوقار و فاخر*],
        text(font: "Vazirmatn", size: 8pt)[پرهیز از واژه‌های بازاری و عامیانه],

        text(font: "Vazirmatn", size: 8.5pt)[*مشاوره‌ای و خیرخواهانه*],
        text(font: "Vazirmatn", size: 8pt)[پیشنهاد قطعه مناسب نه لزوماً گران‌تر],

        text(font: "Vazirmatn", size: 8.5pt)[*قاطع در گارانتی*],
        text(font: "Vazirmatn", size: 8pt)[تاکید بر تعهد تعویض قطعه درجا]
      )

      #v(6pt)
      #rect(
        width: 100%,
        fill: rgb("080D1A"),
        stroke: 0.5pt + rgb("00F2FE"),
        radius: 4pt,
        inset: 8pt,
        [
          #text(font: "Vazirmatn", size: 8.5pt, fill: rgb("E0F2FE"), dir: rtl)[
            *شعار سازمانی مصوب:*\
            انگلیسی: *HYPERD — HIGH PERFORMANCE DELIVERED*\
            فارسی: *هایپرد؛ اوج پایداری و توان پردازش*
          ]
        ]
      )
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 5: LOGO CONCEPT & SILICON ANATOMY
// =============================================================================

#brand-header("03", "LOGO CONCEPT & SILICON ANATOMY", "آناتومی ۳ لایه مهندسی ویفر و چیپلت‌های شناور")

#grid(
  columns: (1.1fr, 0.9fr),
  gutter: 20pt,
  [
    #image("hyperd_silicon_chiplet_detailed_master.png", width: 84%)
  ],
  [
    #card("تشریح لایه‌به‌لایه ساختار آرم رسمی", [
      طراحی نشان هایپرد بر پایه ساختار حقیقی *تراشه‌های پردازشی پیشرفته سه بعدی (3D Stacking & Chiplet Architecture)* استوار است:

      #v(5pt)
      #text(font: "Vazirmatn", size: 8.5pt, dir: rtl)[
        *۱. دیسک ویفر سیلیکونی پایه (Silicon Wafer Base):*\
        صفحه مدور پایینی با رینگ محیطی استیل مات و خطوط مداری نانومتری آبی‌رنگ؛ نماد ریشه و اصالت بنیادین کامپیوترها و اطمینان از خلوص متریال قطعات.

        #v(5pt)
        *۲. اینترپوزر نوری شفاف و معلق (Translucent Cyan Interposer):*\
        صفحه چهارگوش شیشه‌ای معلق با لبه‌های نورانی فیروزه‌ای که میان ویفر و چیپ‌ها پل زده است؛ نماد پهنای باند بی‌نهایت، حذف گلوگاه‌های سرعت و اتصال با نور نئونی.

        #v(5pt)
        *۳. ماتریس چهارتایی چیپلت‌ها (2x2 Titanium Chiplet Dies):*\
        چهار بلوک مربعی از جنس تیتانیوم دودی با خطوط برس‌خورده و پخ‌های آلومینیومی در زاویه ۳۰ درجه ایزومتریک؛ نماد پردازش چند‌رشته‌ای، استحکام فیزیکی و ورک‌استیشن‌های رده‌بالا.

        #v(5pt)
        *۴. درخشش اختصاصی حرف D:*\
        تفکیک رنگ حرف D با هسته نئونی در انتهای کلمه HYPERD به عنوان نقطه کانون و متمایزکننده هویت دیجیتال و نشان اصالت فروشگاه.
      ]
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 6: LOGO LOCKUPS & CLEAR SPACE
// =============================================================================

#brand-header("04", "LOGO LOCKUPS & CLEAR SPACE", "قفل‌های رسمی لوگو، حریم امن و حداقل ابعاد مجاز")

#grid(
  columns: (1.2fr, 0.8fr),
  gutter: 18pt,
  [
    #image("hyperd_chiplet_master_brand.png", width: 94%)
  ],
  [
    #card("قاعده حاشیه امن (Clear Space Rule)", [
      جهت تضمین خوانایی و نمایش مقتدرانه لوگوی Hyperd، هیچ متن، تصویر، خط یا کادری نباید وارد محدوده حریم امن لوگو گردد.

      #v(5pt)
      • *واحد سنجش حریم امن (معیار X):* اندازه حاشیه امن از هر جهت، دقیقاً معادل با ارتفاع حرف «H» در تایپوگرافی کلمه HYPERD در نظر گرفته می‌شود.\
      • *فاصله‌گذاری پیرامونی:* از هر ۴ جهت آرم و کلمه HYPERD، حداقل به مقدار یک برابر ارتفاع حرف H فضای منفی تنفس بصری الزامی است.
    ])

    #v(8pt)
    #card("حداقل ابعاد استفاده (Minimum Sizes)", [
      • *رسانه‌های چاپی:* حداقل عرض مجاز در چاپ افست و دیجیتال *۳۵ میلی‌متر* است تا شبکه ظریف مدارهای ویفر مات و محو نشود.\
      • *رسانه‌های دیجیتال:* حداقل عرض مجاز *۱۲۰ پیکسل* برای نسخه کامل لوگو با نوشته.\
      • *فاوآیکون و نشانگرهای بسیار کوچک (۱۶ الی ۳۲ پیکسل):* مجاز به استفاده از نسخه مونوگرام خلاصه (صرفاً ۴ بلوک با حرف D نئونی) بدون خطوط ریز کف.
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 7: COLOR ARCHITECTURE
// =============================================================================

#brand-header("05", "COLOR ARCHITECTURE & SPECIFICATIONS", "سیستم جامع رنگ‌های رسمی سازمانی و مشخصات چاپ")

#text(font: "Vazirmatn", size: 9.5pt, dir: rtl)[
  رنگ‌های برند Hyperd برگرفته از متریال‌های سخت‌افزاری صنعتی نظیر سیلیکون خالص، استیل تیتانیوم و نورپردازی سرد ال‌ای‌دی است:
]

#v(6pt)

#grid(
  columns: (1fr, 1fr, 1fr, 1fr),
  gutter: 10pt,
  [
    #rect(width: 100%, height: 70pt, fill: rgb("0B0D10"), stroke: 1pt + rgb("334155"), radius: 4pt)
    #v(4pt)
    #align(left)[
      #text(font: "Space Grotesk", size: 8.5pt, weight: "bold", fill: rgb("FFFFFF"))[OBSIDIAN SLATE] \
      #text(font: "Space Grotesk", size: 7.5pt, fill: rgb("94A3B8"))[
        HEX: \#0B0D10 \
        RGB: 11, 13, 16 \
        CMYK: 73, 67, 65, 82 \
        Pantone: Black 6 C
      ]
    ]
  ],
  [
    #rect(width: 100%, height: 70pt, fill: rgb("00F2FE"), radius: 4pt)
    #v(4pt)
    #align(left)[
      #text(font: "Space Grotesk", size: 8.5pt, weight: "bold", fill: rgb("00F2FE"))[NEON CYAN] \
      #text(font: "Space Grotesk", size: 7.5pt, fill: rgb("94A3B8"))[
        HEX: \#00F2FE \
        RGB: 0, 242, 254 \
        CMYK: 65, 0, 10, 0 \
        Pantone: Process Cyan C
      ]
    ]
  ],
  [
    #rect(width: 100%, height: 70pt, fill: rgb("0284C7"), radius: 4pt)
    #v(4pt)
    #align(left)[
      #text(font: "Space Grotesk", size: 8.5pt, weight: "bold", fill: rgb("38BDF8"))[DEEP COBALT] \
      #text(font: "Space Grotesk", size: 7.5pt, fill: rgb("94A3B8"))[
        HEX: \#0284C7 \
        RGB: 2, 132, 199 \
        CMYK: 88, 45, 0, 0 \
        Pantone: 2192 C
      ]
    ]
  ],
  [
    #rect(width: 100%, height: 70pt, fill: rgb("CBD5E1"), radius: 4pt)
    #v(4pt)
    #align(left)[
      #text(font: "Space Grotesk", size: 8.5pt, weight: "bold", fill: rgb("CBD5E1"))[PLATINUM SILVER] \
      #text(font: "Space Grotesk", size: 7.5pt, fill: rgb("94A3B8"))[
        HEX: \#CBD5E1 \
        RGB: 203, 213, 225 \
        CMYK: 20, 14, 12, 0 \
        Pantone: 877 C Metallic
      ]
    ]
  ]
)

#v(8pt)
#card("قانون طلایی تناسب رنگ‌ها (The 60-30-10 Brand Balance)", [
  • *۶۰٪ مشکی آبسیدین مات:* رنگ مسلط در دکوراسیون، هاردباکس‌های بسته‌بندی، پس‌زمینه وب‌سایت و کاتالوگ‌ها.\
  • *۳۰٪ استیل پلاتینیوم و تیتانیوم:* حروف کلمه HYPER، خطوط برش صنعتی، بج سینه و فریم نمایشگرها.\
  • *۱۰٪ آبی سایان نئونی و کبالت:* کانون‌های جلب توجه، حرف D، نور بک‌لایت تابلوی شب، و برچسب‌های پلمب گارانتی.
])

#pagebreak()

// =============================================================================
// PAGE 8: TYPOGRAPHY MATRIX
// =============================================================================

#brand-header("06", "TYPOGRAPHY MATRIX (EN & FA)", "ماتریس تایپوگرافی سازمانی (قلم‌های انگلیسی و فارسی)")

#grid(
  columns: (1fr, 1fr),
  gutter: 18pt,
  [
    #en-card("PRIMARY ENGLISH: SPACE GROTESK", [
      #align(left)[
        #text(font: "Space Grotesk", size: 13pt, weight: "bold", fill: rgb("FFFFFF"))[
          ABCDEFGHIJKLMN OPQRSTUVWXYZ \
          abcdefghijklmn opqrstuvwxyz \
          0123456789 - HIGH PERFORMANCE
        ]
        #v(4pt)
        #text(font: "Vazirmatn", size: 8.5pt, fill: rgb("94A3B8"), dir: rtl)[
          *کاربرد:* سرتیترهای انگلیسی، نام محصولات در سایت، بسته‌بندی و تبلیغات محیطی. این قلم به دلیل زوایای شارپ و هندسه مدرن، هماهنگی کامل با دنیای سخت‌افزار دارد.
        ]
      ]
    ])

    #v(8pt)
    #en-card("SECONDARY ENGLISH: INTER (TECHNICAL & SPECS)", [
      #align(left)[
        #text(font: "Inter", size: 10pt, weight: "medium", fill: rgb("CBD5E1"))[
          NVIDIA RTX 4090 24GB • AMD Ryzen 9 7950X 16-Core \
          DDR5-6000MHz CL30 • Gen5 NVMe 4TB Read 12,400MB/s
        ]
        #v(4pt)
        #text(font: "Vazirmatn", size: 8pt, fill: rgb("94A3B8"), dir: rtl)[
          *کاربرد:* جداول بنچمارک، فاکتورهای رسمی، متون ریز گارانتی و اطلاعات فنی.
        ]
      ]
    ])
  ],
  [
    #card("فونت رسمی فارسی: وزیرمتن (Vazirmatn)", [
      #align(right)[
        #text(font: "Vazirmatn", size: 13pt, weight: "bold", fill: rgb("FFFFFF"), dir: rtl)[
          ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی \
          ۱۲۳۴۵۶۷۸۹۰ • مهندسی پردازش فوق‌سریع هایپرد
        ]
        #v(6pt)
        #text(font: "Vazirmatn", size: 8.5pt, dir: rtl)[
          فونت *وزیرمتن* اثر صابر راستی‌کردار به عنوان فونت استاندارد متون فارسی هایپرد برگزیده شده است:

          #v(4pt)
          • *وزیرمتن بولد (Bold):* تیترهای کاتالوگ، بیلبوردهای تبلیغاتی و عناوین وب‌سایت.\
          • *وزیرمتن مدیوم (Medium):* زیرعنوان‌ها، دسته‌بندی قطعات و نام دسته‌ها.\
          • *وزیرمتن رگولار (Regular):* متون پاراگراف‌ها، مشخصات گارانتی و فاکتورها.
        ]
      ]
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 9: CO-BRANDING & PARTNERSHIPS
// =============================================================================

#brand-header("07", "CO-BRANDING & PARTNERSHIPS", "قوانین برندینگ مشترک با غول‌های فناوری (Intel, Nvidia, ASUS)")

#grid(
  columns: (1.1fr, 0.9fr),
  gutter: 18pt,
  [
    #card("اصول هم‌نشینی و نمایندگی رسمی شرکا", [
      هایپرد به عنوان یک زنجیره خرده‌فروشی و مرکز اسمبل مجاز، لوگوی خود را در کنار بزرگ‌ترین کمپانی‌های سخت‌افزاری جهان (مانند Intel, Nvidia, AMD, ASUS ROG, MSI, Corsair) قرار می‌دهد:

      #v(5pt)
      *قوانین درج نشان‌های همکار:*
      
      #v(4pt)
      ۱. *خط حائل سازمانی (Divider Rule):* لوگوی هایپرد در سمت چپ/بالا قرار گرفته و با یک خط باریک ۱pt پلاتینیومی (`#CBD5E1`) با شفافیت ۵۰٪ از لوگوی پارتنر تفکیک می‌گردد.\
      ۲. *توازن بصری ارتفاع (Optical Balance):* حداکثر ارتفاع بصری آرم همکار نباید از ۸۰٪ ارتفاع تایپوگرافی HYPERD فراتر رود تا مرجعیت هایپرد مخدوش نشود.\
      ۳. *بج‌های پارتنر رسمی:* نشان‌های تاییدیه نظیر "Intel Titanium Partner" یا "ASUS ROG Powered" همیشه در گوشه پایین سمت راست بنرها با رعایت حریم امن درج می‌شوند.
    ])
  ],
  [
    #rect(
      width: 100%,
      fill: rgb("0E1524"),
      stroke: 1pt + rgb("1E293B"),
      radius: 6pt,
      inset: 12pt,
      [
        #align(left)[
          #text(font: "Space Grotesk", size: 10pt, weight: "bold", fill: rgb("00F2FE"))[CO-BRANDING LAYOUT STANDARD]
        ]
        #v(8pt)
        #rect(
          width: 100%,
          fill: rgb("080C14"),
          stroke: 0.5pt + rgb("334155"),
          radius: 4pt,
          inset: 10pt,
          [
            #grid(
              columns: (1fr, auto, 1fr),
              
              text(font: "Space Grotesk", size: 13pt, weight: "bold", fill: rgb("FFFFFF"))[HYPER#text(fill: rgb("00F2FE"))[D]],
              line(start: (0pt, -8pt), end: (0pt, 8pt), stroke: 1pt + rgb("64748B")),
              text(font: "Space Grotesk", size: 10.5pt, weight: "bold", fill: rgb("94A3B8"))[NVIDIA GEFORCE]
            )
          ]
        )
        #v(6pt)
        #align(right)[
          #text(font: "Vazirmatn", size: 8pt, fill: rgb("94A3B8"), dir: rtl)[
            کنتراست استاندارد روی بک‌گراند تیره، خط حائل نیمه‌شفاف و تعادل فاصله.
          ]
        ]
      ]
    )
  ]
)

#pagebreak()

// =============================================================================
// PAGE 10: UNACCEPTABLE USAGES (DON'TS)
// =============================================================================

#brand-header("08", "INCORRECT USAGE & RESTRICTIONS", "خطاهای ممنوعه و موارد اکیداً غیرمجاز در استفاده از لوگو")

#text(font: "Vazirmatn", size: 9pt, dir: rtl)[
  هرگونه تغییر خودسرانه در فرم، نسبت‌ها، متریال‌ها و جلوه‌های نوری لوگوی هایپرد نقض استاندارد برند محسوب می‌گردد:
]

#v(6pt)

#grid(
  columns: (1fr, 1fr),
  gutter: 12pt,
  [
    #card("۱. تغییر نسبت ابعاد (Stretching / Distorting)", [
      کشیدن طولی یا عرضی لوگو بدون قفل نگه‌داشتن تناسب ابعاد (Aspect Ratio) ممنوع است.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۲. تغییر رنگ لایه‌های سیلیکونی و نئون", [
      عوض کردن نور سایان به قرمز، سبز، زرد یا بنفش مطلقاً غیرمجاز است.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۳. حذف یا جابجایی ۴ بلوک چیپلت", [
      حذف لایه چیپلت‌ها، دیسک ویفر یا تغییر زاویه ۳۰ درجه هندسی ممنوع است.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۴. هم‌رنگ کردن حرف D با بدنه نوشته", [
      حرف D در انتهای کلمه HYPERD همیشه باید با رنگ متمایز سایان بدرخشد.
    ], border: rgb("EF4444"))
  ],
  [
    #card("۵. قرار دادن روی پس‌زمینه‌های شلوغ", [
      استفاده از لوگو روی پس‌زمینه‌های رنگارنگ، الگوهای نامنظم یا عکس‌های شلوغ مجاز نیست.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۶. چرخش نامتعارف زاویه ایزومتریک", [
      کج کردن لوگو، معکوس کردن یا افقی کردن بلوک‌های ایزومتریک ممنوع است.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۷. تعویض فونت کلمه HYPERD", [
      بازنویسی نام برند با فونت‌های متفرقه یا عمومی کامپیوتر ممنوع است.
    ], border: rgb("EF4444")),
    #v(6pt)
    #card("۸. افزودن استروک ضخیم یا دراپ‌شدوهای غیرطبیعی", [
      اضافه کردن کادرهای خطی ناهماهنگ یا سایه‌های اغراق‌آمیز به آرم ممنوع است.
    ], border: rgb("EF4444"))
  ]
)

#pagebreak()

// =============================================================================
// PAGE 11: RETAIL & SHOWROOM ARCHITECTURE
// =============================================================================

#brand-header("09", "RETAIL ARCHITECTURE & SIGNAGE", "معماری فروشگاه، دکوراسیون داخلی و تابلوی پذیرش")

#grid(
  columns: (1.2fr, 0.8fr),
  gutter: 18pt,
  [
    #image("hyperd_store_facade_mockup.png", width: 94%)
  ],
  [
    #card("استانداردهای فیزیکی شو‌روم Hyperd", [
      فضای فروشگاه باید القاکننده یک *لابراتوار فوق‌پیشرفته سخت‌افزار* و یک گالری باشکوه تکنولوژی باشد:

      #v(5pt)
      • *دیوار شاخص پذیرش:* پنل‌های شیاردار چوبی/کامپوزیت مشکی مات زغالی با تابلوی سه‌بعدی استیل آلومینیومی برس‌خورده و نور مخفی بک‌لایت آبی کبالت (`#00F2FE`).\
      • *ویترین‌ها و استندهای نمایش:* شیشه‌های ضدبازتاب سوپرکلیر با بدنه تیتانیومی مات برای نمایش قطعات پرچمدار و سیستم‌های واترکولینگ کاستوم.\
      • *میز تست و کانفیگ اختصاصی:* فضایی اختصاصی با مانیتورهای اولتراواید برای مشاوره فنی چهره‌به‌چهره، بررسی بنچمارک‌ها و انتخاب دقیق قطعات.\
      • *کف‌پوش و سقف:* بتن اکسپوز براش‌خورده یا سرامیک طوسی مات اسلیت همراه با چراغ‌های خطی اسپات‌لایت متمرکز.
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 12: PACKAGING, SECURITY & MERCHANDISE
// =============================================================================

#brand-header("10", "PACKAGING & SECURITY TOUCHPOINTS", "بسته‌بندی هاردباکس، کارت VIP و سیستم پلمب امنیتی")

#grid(
  columns: (1.2fr, 0.8fr),
  gutter: 18pt,
  [
    #image("hyperd_chiplet_merch_mockup.png", width: 94%)
  ],
  [
    #card("هویت اقلام فیزیکی و سیستم گارانتی", [
      تجربه آنباکسینگ در هایپرد باید حس تحویل یک کالای گرانبها و بی‌همتا را ایجاد کند:

      #v(5pt)
      • *هاردباکس بسته‌بندی سیستم‌ها:* جعبه مقوایی مشکی مات سافت‌تاچ با روکش مخمل‌مانند، چاپ لوگو با فویل نقره‌ای و یووی موضعی برجسته.\
      • *پلمب هولوگرامی ضدجعل (Tamper-Evident):* برچسب خردشونده امنیتی با بازتاب متالایز و پترن میکرونی چیپلت برای پلمب قطعات و درب کیس‌ها.\
      • *کارت فلزی گارانتی VIP:* کارت تیتانیومی مشکی برس‌خورده با حکاکی لیزری شماره سریال و کیوآرکد رهگیری آنلاین وضعیت پشتیبانی قطعات.\
      • *بند آویز و پوشاک پرسنل:* لنیارد بافت مشکی هایپرد با کارابین فلزی دودی برای کارت شناسایی کارشناسان فنی فروشگاه.
    ])
  ]
)

#pagebreak()

// =============================================================================
// PAGE 13: DIGITAL GUIDELINES & CLOSING STATEMENT
// =============================================================================

#brand-header("11", "DIGITAL ECOSYSTEM & BRAND CUSTODIANSHIP", "حضور دیجیتال، وب‌سایت و تعهدنامه حفاظت از برند")

#grid(
  columns: (1fr, 1fr),
  gutter: 18pt,
  [
    #card("دستورالعمل رابط کاربری دیجیتال (UI/UX Standards)", [
      • *وب‌سایت و فروشگاه آنلاین:* رابط کاربری در حالت تیره (Dark Mode First) با زمینه `#080C14`، تایپوگرافی سفید یخی و دکمه‌های اقدام به رنگ سایان نئونی (`#00F2FE`).\
      • *شبکه‌های اجتماعی (اینستاگرام و لینکدین):* کاورهای منسجم با فریم‌های خاکستری تیتانیومی و خطوط افقی سایان، بدون شلوغی و با تمرکز بر تصویر قطعه سخت‌افزاری.\
      • *امضای ایمیل رسمی پرسنل:* لوگوی رسمی، نام، سمت، تلفن سازمانی و لینک پیگیری آنلاین گارانتی.
    ])

    #v(8pt)
    #rect(
      width: 100%,
      fill: rgb("060A12"),
      stroke: 1pt + rgb("0284C7"),
      radius: 6pt,
      inset: 10pt,
      [
        #align(center)[
          #text(font: "Space Grotesk", size: 10pt, weight: "bold", fill: rgb("00F2FE"), tracking: 2pt)[
            HYPERD • ELEVATING HARDWARE STANDARDS
          ] \
          #v(2pt)
          #text(font: "Vazirmatn", size: 8.5pt, fill: rgb("94A3B8"), dir: rtl)[
            ارتباط با واحد مدیریت برند و استانداردسازی:\
            Email: brand\@hyperd.com • Website: www.hyperd.com
          ]
        ]
      ]
    )
  ],
  [
    #card("تعهدنامه حفاظت از اصالت برند هایپرد", [
      هویت سازمانی Hyperd ثمره ده‌ها ساعت تحلیل تخصصی بازار، روانشناسی مشتریان حوزه تکنولوژی و مهندسی دقیق بصری است. این کتابچه سندی زنده و تخطی‌ناپذیر است که تداوم شکوه، اعتبار و پرستیژ برند را در سراسر زنجیره فعالیت تضمین می‌نماید.

      #v(5pt)
      کلیه مدیران شعب، نمایندگان، پیمانکاران چاپ و سازندگان ملزم به رعایت تک‌تک استانداردهای این دستورالعمل بوده و هرگونه بازتولید یا بهره‌برداری باید منطبق بر این ضوابط صورت پذیرد.

      #v(10pt)
      #align(center)[
        #line(length: 50%, stroke: 0.5pt + rgb("475569"))
        #v(3pt)
        #text(font: "Space Grotesk", size: 9pt, weight: "bold", fill: rgb("FFFFFF"))[
          HYPERD EXECUTIVE BRAND COUNCIL
        ] \
        #text(font: "Vazirmatn", size: 8pt, fill: rgb("64748B"), dir: rtl)[
          شورای عالی نظارت بر برند و کنترل کیفیت سازمانی
        ]
      ]
    ])
  ]
)
