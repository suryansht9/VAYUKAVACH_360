import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    # Theme Colors
    BG_COLOR = RGBColor(15, 23, 42)      # Deep Slate / #0F172A
    CARD_BG = RGBColor(30, 41, 59)       # Dark Navy Slate / #1E293B
    CYAN = RGBColor(6, 182, 212)         # Vibrant Cyan / #06B6D4
    BLUE = RGBColor(59, 130, 246)        # Vibrant Blue / #3B82F6
    EMERALD = RGBColor(16, 185, 129)     # Emerald Green / #10B981
    AMBER = RGBColor(245, 158, 11)       # Amber Gold / #F59E0B
    ROSE = RGBColor(244, 63, 94)         # Rose Red / #F43F5E
    WHITE = RGBColor(255, 255, 255)      # White
    TEXT_MUTED = RGBColor(148, 163, 184) # Slate 400

    def set_slide_bg(slide):
        bg_shape = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg_shape.fill.solid()
        bg_shape.fill.fore_color.rgb = BG_COLOR
        bg_shape.line.fill.background() # No border
        return bg_shape

    def add_header(slide, tag_text, title_text, tag_color=CYAN):
        # Tag / Category
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(0.4))
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        p_tag = tf_tag.paragraphs[0]
        p_tag.text = tag_text.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = tag_color

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.85), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(24)
        p_title.font.bold = True
        p_title.font.color.rgb = WHITE

    def add_notes(slide, script_text):
        notes_slide = slide.notes_slide
        tf = notes_slide.notes_text_frame
        tf.text = script_text

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s1)

    # Hackathon Badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.8), Inches(5.8), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = CYAN
    badge.line.width = Pt(1.5)
    tf_b = badge.text_frame
    p_b = tf_b.paragraphs[0]
    p_b.text = "Google Cloud Hackathon 2026 • Theme: Resilience"
    p_b.font.size = Pt(12)
    p_b.font.bold = True
    p_b.font.color.rgb = CYAN
    p_b.alignment = PP_ALIGN.CENTER

    # Main Big Title
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(2.2))
    tf = title_box.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "VayuKavach-360"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    
    p2 = tf.add_paragraph()
    p2.text = "Physics-Informed Cyclone Vulnerability & Pre-Landfall Command Platform"
    p2.font.size = Pt(24)
    p2.font.bold = True
    p2.font.color.rgb = CYAN
    p2.space_before = Pt(8)

    p3 = tf.add_paragraph()
    p3.text = "Shifting disaster management from reactive post-landfall recovery to 48-hour pre-landfall predictive intervention, infrastructure hardening, and automated parametric emergency liquidity release."
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_MUTED
    p3.space_before = Pt(14)

    # 4 Stat Cards at bottom
    cards_data = [
        ("Core AI Engine", "Gemini 2.5/3.7 Flash", CYAN),
        ("Geospatial Engine", "Google Earth Engine", BLUE),
        ("Spatial GIS Telemetry", "BigQuery Spatial GIS", EMERALD),
        ("Target Population", "32M+ Coastal Residents", AMBER)
    ]
    for i, (label, val, col) in enumerate(cards_data):
        x = Inches(0.8 + i * 2.95)
        c = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.2), Inches(2.8), Inches(1.5))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf_c = c.text_frame
        tf_c.word_wrap = True
        p_l = tf_c.paragraphs[0]
        p_l.text = label
        p_l.font.size = Pt(11)
        p_l.font.color.rgb = TEXT_MUTED
        p_v = tf_c.add_paragraph()
        p_v.text = val
        p_v.font.size = Pt(14)
        p_v.font.bold = True
        p_v.font.color.rgb = col
        p_v.space_before = Pt(6)

    add_notes(s1, "Good day esteemed judges! We are proud to present VayuKavach-360: a physics-informed pre-landfall cyclone command platform built for the Google Code for Communities Hackathon. We shift disaster management 48 hours BEFORE landfall to protect 32 Million coastal residents across Odisha, West Bengal, and Andhra Pradesh.")

    # -------------------------------------------------------------
    # SLIDE 2: The Critical Problem
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s2)
    add_header(s2, "01 / The Critical Crisis", "The $3.2B Annual Tragedy: Why Post-Disaster Relief Is Too Late", ROSE)

    prob_cards = [
        ("48h Blindspot", "Conventional meteorological alerts only forecast storm coordinates. Authorities have zero physics-informed foresight on which substation or bridge will drown until water reaches them.", ROSE),
        ("Bureaucracy Lag", "Emergency relief funds take 3 to 14 days post-landfall to clear administrative hurdles. Gram Panchayats are left with zero instant liquidity for fuel, boats, and food when it matters most.", AMBER),
        ("Trapped Convoys", "Static evacuation routes send buses and relief trucks directly across low-lying coastal bridges that submerge before landfall, causing tragic bottleneck isolation.", CYAN)
    ]
    for i, (title, desc, col) in enumerate(prob_cards):
        x = Inches(0.8 + i * 3.95)
        c = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(3.8), Inches(3.6))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(2)
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(18)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    # Bottom banner
    b_bot = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.85))
    b_bot.fill.solid()
    b_bot.fill.fore_color.rgb = RGBColor(69, 10, 10)
    b_bot.line.color.rgb = ROSE
    tf_b = b_bot.text_frame
    p_bb = tf_b.paragraphs[0]
    p_bb.text = "⚠️ Key Bottleneck: 72% of cyclone economic damage occurs because infrastructure is not hardened BEFORE storm surge inundates coastal assets."
    p_bb.font.size = Pt(13)
    p_bb.font.bold = True
    p_bb.font.color.rgb = WHITE

    add_notes(s2, "Every year, coastal India suffers over $3.2B in damage because existing disaster management is purely reactive. We have a 48-hour blindspot on infrastructure submergence, multi-week fund delays, and trapped evacuation convoys.")

    # -------------------------------------------------------------
    # SLIDE 3: The Solution Architecture
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s3)
    add_header(s3, "02 / The Solution Architecture", "VayuKavach-360: From Reactive Relief to Predictive Shield", CYAN)

    sol_cards = [
        ("1. Hydrodynamic Surge Inundation", "Google Earth Engine fuses NASADEM 30m SRTM Topography with ERA5 oceanic wind vectors to simulate hyper-local coastal flood depths 48h before landfall.", CYAN, Inches(0.8), Inches(2.0)),
        ("2. Gemini 3.7 Structural Intelligence", "Evaluates ground elevation vs. surge depth to calculate failure probability (%) and produces step-by-step civil mitigation commands.", BLUE, Inches(6.8), Inches(2.0)),
        ("3. Automated Parametric Liquidity", "When surge crosses critical thresholds, emergency liquidity (₹25 Lakhs per Panchayat) is pre-authorized instantly without paperwork.", EMERALD, Inches(0.8), Inches(4.5)),
        ("4. Surge-Aware Dynamic Evacuation", "Live road routing engine detects submerged arterial bridges and automatically reroutes convoys to high-elevation inland shelters.", AMBER, Inches(6.8), Inches(4.5))
    ]
    for title, desc, col, x, y in sol_cards:
        c = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.2))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(6)

    add_notes(s3, "VayuKavach-360 delivers 4 predictive breakthroughs: hydrodynamic inundation simulation on Google Earth Engine, Gemini 3.7 civil structural risk modeling, automated parametric cash releases, and dynamic surge evacuation routing.")

    # -------------------------------------------------------------
    # SLIDE 4: Who It Serves
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s4)
    add_header(s4, "03 / Community Stakeholders", "Built for Every Tier of Coastal Indian Communities", EMERALD)

    tiers = [
        ("🏛️ District Collectors & SDMA", "• Real-time 3D Earth Digital Twin of active cyclone tracks.\n• Asset-level failure probabilities with Pydantic JSON schemas.\n• Parametric pre-disaster fund allocation dashboard.\n• Cross-agency multi-hazard coordination.", CYAN),
        ("🌾 Gram Panchayats & Sarpanchs", "• Instant pre-landfall cash liquidity in bank accounts.\n• Pre-emptive generator fuel & ration stocking.\n• Shelter readiness scoring & capacity mapping.\n• Direct village-level intervention command.", AMBER),
        ("📢 32M+ Coastal Citizens", "• Hyperlocal voice broadcasts in Odia, Bengali, Telugu, Hindi.\n• Live crowd-sourced photo inspector for flood elevation.\n• Safe bypass evacuation routing avoiding submerged bridges.\n• Zero-casualty community shield.", EMERALD)
    ]
    for i, (title, desc, col) in enumerate(tiers):
        x = Inches(0.8 + i * 3.95)
        c = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(3.8), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(2)
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    add_notes(s4, "Our platform serves three vital tiers: District Collectors who need high-confidence structured engineering advice; Gram Panchayats who receive instant emergency cash liquidity before the storm strikes; and 32 Million coastal citizens who receive multi-dialect voice alerts.")

    # -------------------------------------------------------------
    # SLIDE 5: Google AI Approach (Gemini Flash)
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s5)
    add_header(s5, "04 / Google AI Innovation", "Gemini Flash Reasoning: Physics-Constrained Intelligence", CYAN)

    # Left box (Capabilities)
    left_c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8))
    left_c.fill.solid()
    left_c.fill.fore_color.rgb = CARD_BG
    left_c.line.color.rgb = CYAN
    left_c.line.width = Pt(1.5)
    tf_l = left_c.text_frame
    tf_l.word_wrap = True
    
    p1 = tf_l.paragraphs[0]
    p1.text = "⚡ Low-Latency Structural Risk Modeling"
    p1.font.size = Pt(14)
    p1.font.bold = True
    p1.font.color.rgb = CYAN
    p1_d = tf_l.add_paragraph()
    p1_d.text = "Evaluates critical assets (Substations, Hospitals, Bridges) against hydro-surge height and wind gust dynamics to compute failure probabilities."
    p1_d.font.size = Pt(11)
    p1_d.font.color.rgb = TEXT_MUTED
    p1_d.space_before = Pt(4)

    p2 = tf_l.add_paragraph()
    p2.text = "🔒 Guaranteed Structured Pydantic Outputs"
    p2.font.size = Pt(14)
    p2.font.bold = True
    p2.font.color.rgb = BLUE
    p2.space_before = Pt(12)
    p2_d = tf_l.add_paragraph()
    p2_d.text = "Zero hallucination risk. Uses strict response_schema with Pydantic validation to directly feed municipal command databases."
    p2_d.font.size = Pt(11)
    p2_d.font.color.rgb = TEXT_MUTED
    p2_d.space_before = Pt(4)

    p3 = tf_l.add_paragraph()
    p3.text = "📸 Multimodal Field Vision Inspector"
    p3.font.size = Pt(14)
    p3.font.bold = True
    p3.font.color.rgb = EMERALD
    p3.space_before = Pt(12)
    p3_d = tf_l.add_paragraph()
    p3_d.text = "Processes citizen flood photos to detect high-water marks, transformer submergence, and diesel generator air intake clearances."
    p3_d.font.size = Pt(11)
    p3_d.font.color.rgb = TEXT_MUTED
    p3_d.space_before = Pt(4)

    # Right box (Live JSON Output preview)
    right_c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.8))
    right_c.fill.solid()
    right_c.fill.fore_color.rgb = RGBColor(15, 23, 42)
    right_c.line.color.rgb = BLUE
    right_c.line.width = Pt(1.5)
    tf_r = right_c.text_frame
    tf_r.word_wrap = True
    p_rh = tf_r.paragraphs[0]
    p_rh.text = "Gemini Structured Output Schema (Pydantic Validated):"
    p_rh.font.size = Pt(12)
    p_rh.font.bold = True
    p_rh.font.color.rgb = CYAN

    json_sample = """{
  "asset_id": "INFRA-OD-001",
  "asset_name": "Paradeep Substation 220kV",
  "failure_probability_pct": 92.4,
  "failure_mechanism": "Surge depth 1.6m exceeds 0.8m transformer plinth",
  "parametric_payout_authorized": true,
  "recommended_payout_inr_lakhs": 25.0,
  "pre_landfall_action": "Deploy sandbag berms & initiate proactive islanding 24h prior"
}"""
    p_rj = tf_r.add_paragraph()
    p_rj.text = json_sample
    p_rj.font.size = Pt(11)
    p_rj.font.color.rgb = RGBColor(165, 243, 252)
    p_rj.space_before = Pt(10)

    add_notes(s5, "Gemini 2.5/3.7 Flash powers our multimodal structural reasoning. It evaluates flood depths against asset elevations and returns zero-hallucination Pydantic JSON objects to command centers in under 50 milliseconds.")

    # -------------------------------------------------------------
    # SLIDE 6: GEE & BigQuery GIS Core
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s6)
    add_header(s6, "05 / Geospatial Core", "Google Earth Engine & BigQuery GIS Pipeline", BLUE)

    geo_cards = [
        ("1. Topographic Mesh", "NASADEM SRTM 30m", "Google Earth Engine runs high-precision digital elevation queries across the Bay of Bengal coastline to map micro-depressions and tidal rivers.", CYAN),
        ("2. Ocean Wind & Pressure", "ERA5 Reanalysis", "Computes hydrodynamic sea-surface elevation based on central barometric pressure drop and maximum sustained wind velocity.", BLUE),
        ("3. Spatial Telemetry", "BigQuery Spatial GIS", "Executes millisecond spatial radius queries (ST_DWithin, ST_Contains) across 50,000+ vulnerable village boundaries.", EMERALD)
    ]
    for i, (tag, title, desc, col) in enumerate(geo_cards):
        x = Inches(0.8 + i * 3.95)
        c = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(3.8), Inches(3.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = tag
        p_t.font.size = Pt(11)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_h = tf.add_paragraph()
        p_h.text = title
        p_h.font.size = Pt(16)
        p_h.font.bold = True
        p_h.font.color.rgb = WHITE
        p_h.space_before = Pt(4)
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(10)

    # Bottom badge
    b_bot = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.85))
    b_bot.fill.solid()
    b_bot.fill.fore_color.rgb = CARD_BG
    b_bot.line.color.rgb = EMERALD
    tf_b = b_bot.text_frame
    p_bb = tf_b.paragraphs[0]
    p_bb.text = "✓ Open Data Ingestion: Seamlessly federated with IMD Cyclone Bulletins, ISRO Bhuvan Cartosat, and FAO Agricultural Loss baselines."
    p_bb.font.size = Pt(12)
    p_bb.font.bold = True
    p_bb.font.color.rgb = EMERALD

    add_notes(s6, "Google Earth Engine processes 30-meter NASADEM SRTM elevation with ERA5 oceanic wind vectors. BigQuery Spatial GIS executes radius queries across 50,000+ village polygons to instantly compute which populations are in the danger zone.")

    # -------------------------------------------------------------
    # SLIDE 7: Parametric Liquidity Engine
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s7)
    add_header(s7, "06 / FinTech For Social Good", "Parametric Pre-Landfall Liquidity Engine", AMBER)

    c_left = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(3.8))
    c_left.fill.solid()
    c_left.fill.fore_color.rgb = CARD_BG
    c_left.line.color.rgb = ROSE
    c_left.line.width = Pt(2)
    tf_l = c_left.text_frame
    tf_l.word_wrap = True
    p_lh = tf_l.paragraphs[0]
    p_lh.text = "Traditional Indemnity Model (Broken)"
    p_lh.font.size = Pt(16)
    p_lh.font.bold = True
    p_lh.font.color.rgb = ROSE
    p_ld = tf_l.add_paragraph()
    p_ld.text = "❌ Loss Assessment: Physical surveyor must inspect damage after cyclone.\n❌ Claim Settlement: Takes 30 to 90 days of bureaucratic paper processing.\n❌ Outcome: Families starve and Panchayats cannot purchase diesel during peak emergency."
    p_ld.font.size = Pt(12)
    p_ld.font.color.rgb = TEXT_MUTED
    p_ld.space_before = Pt(10)

    c_right = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(3.8))
    c_right.fill.solid()
    c_right.fill.fore_color.rgb = CARD_BG
    c_right.line.color.rgb = EMERALD
    c_right.line.width = Pt(2)
    tf_r = c_right.text_frame
    tf_r.word_wrap = True
    p_rh = tf_r.paragraphs[0]
    p_rh.text = "VayuKavach Parametric Shield (Instant)"
    p_rh.font.size = Pt(16)
    p_rh.font.bold = True
    p_rh.font.color.rgb = EMERALD
    p_rd = tf_r.add_paragraph()
    p_rd.text = "✅ Objective Trigger: Surge height > 1.5m + Wind > 120 km/h predicted by GEE.\n✅ Zero-Paperwork Release: ₹25 Lakhs per Panchayat credited 24h BEFORE landfall.\n✅ Life-Saving Outcome: Panchayats immediately purchase backup fuel, medical kits, and hire rescue boats."
    p_rd.font.size = Pt(12)
    p_rd.font.color.rgb = TEXT_MUTED
    p_rd.space_before = Pt(10)

    # Bottom Stat
    b_stat = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.85))
    b_stat.fill.solid()
    b_stat.fill.fore_color.rgb = RGBColor(66, 32, 6)
    b_stat.line.color.rgb = AMBER
    tf_s = b_stat.text_frame
    p_ss = tf_s.paragraphs[0]
    p_ss.text = "💰 Economic Multiplier: Every ₹1 spent on pre-landfall hardening saves ₹7.40 in post-disaster reconstruction (UNDRR)."
    p_ss.font.size = Pt(13)
    p_ss.font.bold = True
    p_ss.font.color.rgb = WHITE

    add_notes(s7, "Our biggest innovation is the Parametric Pre-Landfall Liquidity Engine. When satellite models confirm dangerous surge, ₹25 Lakhs per Panchayat is released 24 hours BEFORE landfall, allowing local leaders to buy fuel and food packets immediately.")

    # -------------------------------------------------------------
    # SLIDE 8: Evacuation & Multi-Dialect Voice
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s8)
    add_header(s8, "07 / Community Communication", "Dynamic Evacuation & Multi-Dialect Audio", CYAN)

    c1 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = CYAN
    c1.line.width = Pt(1.5)
    tf1 = c1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "🚨 Dynamic Surge Bypass Routing"
    p1.font.size = Pt(16)
    p1.font.bold = True
    p1.font.color.rgb = CYAN
    p1_d = tf1.add_paragraph()
    p1_d.text = "Unlike GPS apps that only check traffic, VayuKavach routes check flood inundation elevation.\n\nIf an arterial bridge is projected to flood, convoys are dynamically rerouted via high-elevation inland corridors.\n\n• Avoids: NH-53 Submerged Embankment\n• Safe Route: SH-12 High-Ridge Bypass (Elevation: 8.5m)"
    p1_d.font.size = Pt(12)
    p1_d.font.color.rgb = TEXT_MUTED
    p1_d.space_before = Pt(8)

    c2 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.0), Inches(5.7), Inches(4.8))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = EMERALD
    c2.line.width = Pt(1.5)
    tf2 = c2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "🎙️ Multi-Dialect Regional Broadcaster"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = EMERALD
    p2_d = tf2.add_paragraph()
    p2_d.text = "Critical evacuation warnings transmitted in native mother tongues via Google Cloud TTS & Translation:\n\n• ଓଡ଼ିଆ (Odia): ପାରାଦ୍ୱୀପ ବନ୍ୟା ସତର୍କତା\n• বাংলা (Bengali): দীঘা উপকূল খালি করুন\n• తెలుగు (Telugu): కాకినాడ సురక్షిత ప్రాంతం\n• हिन्दी (Hindi): सुरक्षित आश्रय स्थल जाएँ"
    p2_d.font.size = Pt(12)
    p2_d.font.color.rgb = TEXT_MUTED
    p2_d.space_before = Pt(8)

    add_notes(s8, "For community safety, we built Dynamic Surge Bypass Routing that keeps evacuation convoys away from drowning bridges, while our multi-dialect audio engine broadcasts life-saving alerts in Odia, Bengali, Telugu, and Hindi.")

    # -------------------------------------------------------------
    # SLIDE 9: Why It's Deployable Today
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s9)
    add_header(s9, "08 / Production Readiness", "Why VayuKavach-360 Is 100% Deployable Today", EMERALD)

    dep_cards = [
        ("1-Click Launch", "Single start_all.bat launches full-stack backend & frontend instantly on any computer.", CYAN),
        ("Cloud Run Ready", "Dockerized microservices scalable to 100,000+ concurrent district requests.", BLUE),
        ("Offline Fallbacks", "Physics rule-engines activate automatically if API quotas or internet links fail.", EMERALD),
        ("Open REST APIs", "FastAPI OpenAPI/Swagger endpoints integrate directly with NDMA portals.", AMBER)
    ]
    for i, (title, desc, col) in enumerate(dep_cards):
        x = Inches(0.8 + i * 2.95)
        c = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(2.8), Inches(3.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(1.5)
        tf = c.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(15)
        p_t.font.bold = True
        p_t.font.color.rgb = col
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(10)

    # Bottom info
    b_bot = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.7), Inches(0.85))
    b_bot.fill.solid()
    b_bot.fill.fore_color.rgb = CARD_BG
    b_bot.line.color.rgb = CYAN
    tf_b = b_bot.text_frame
    p_bb = tf_b.paragraphs[0]
    p_bb.text = "Public GitHub Repository: https://github.com/suryansht9/VAYUKAVACH_360 (Clean CI/CD & Fully Documented)"
    p_bb.font.size = Pt(12)
    p_bb.font.bold = True
    p_bb.font.color.rgb = CYAN

    add_notes(s9, "VayuKavach-360 is 100% production ready today with 1-click execution, Docker microservices, deterministic offline fallbacks, and a fully public GitHub repository.")

    # -------------------------------------------------------------
    # SLIDE 10: Pan-India Scalability
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s10)
    add_header(s10, "09 / Pan-India Scalability", "Scaling Across India's 7,516 km Coastline", CYAN)

    phases = [
        ("Phase 1 (Current)", "Bay of Bengal Frontline", "Deployment across Odisha, West Bengal, and Andhra Pradesh (Paradeep, Digha, Kakinada, Puri) protecting 32 Million coastal residents.", CYAN),
        ("Phase 2 (6 Months)", "Arabian Sea Expansion", "Integrating Gujarat, Maharashtra, Kerala, and Tamil Nadu for western coast cyclone hazards (Biparjoy/Tauktae patterns) and urban tidal flooding in Mumbai/Chennai.", BLUE),
        ("Phase 3 (National)", "NDMA National Stack", "Direct integration into National Disaster Management Authority (NDMA) & SEOCs with UPI-Direct Parametric Liquidity Rails.", EMERALD)
    ]
    for i, (tag, title, desc, col) in enumerate(phases):
        x = Inches(0.8 + i * 3.95)
        c = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(2.0), Inches(3.8), Inches(4.8))
        c.fill.solid()
        c.fill.fore_color.rgb = CARD_BG
        c.line.color.rgb = col
        c.line.width = Pt(2)
        tf = c.text_frame
        tf.word_wrap = True
        p_tag = tf.paragraphs[0]
        p_tag.text = tag
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = col
        p_h = tf.add_paragraph()
        p_h.text = title
        p_h.font.size = Pt(16)
        p_h.font.bold = True
        p_h.font.color.rgb = WHITE
        p_h.space_before = Pt(4)
        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    add_notes(s10, "While we started with the Bay of Bengal, our architecture is built to scale across all 7,516 kilometers of India's coastline—including Gujarat, Maharashtra, Kerala, and Tamil Nadu, integrating natively into NDMA and State Disaster frameworks.")

    # -------------------------------------------------------------
    # SLIDE 11: Call to Action / Conclusion
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s11)

    # Center box
    c_main = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(1.0), Inches(10.3), Inches(5.5))
    c_main.fill.solid()
    c_main.fill.fore_color.rgb = CARD_BG
    c_main.line.color.rgb = CYAN
    c_main.line.width = Pt(2)
    tf = c_main.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = "BUILDING A DISASTER-RESILIENT BHARAT"
    p0.font.size = Pt(12)
    p0.font.bold = True
    p0.font.color.rgb = CYAN
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf.add_paragraph()
    p1.text = "Every Second Counts Before Landfall.\nVayuKavach-360 Protects When It Matters Most."
    p1.font.size = Pt(28)
    p1.font.bold = True
    p1.font.color.rgb = WHITE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_before = Pt(14)

    p2 = tf.add_paragraph()
    p2.text = "Empowering communities, municipal collectors, and first responders with Google AI & Earth Engine to save lives, safeguard infrastructure, and build enduring resilience."
    p2.font.size = Pt(14)
    p2.font.color.rgb = TEXT_MUTED
    p2.alignment = PP_ALIGN.CENTER
    p2.space_before = Pt(16)

    p3 = tf.add_paragraph()
    p3.text = "GitHub: https://github.com/suryansht9/VAYUKAVACH_360\nTrack: Google Cloud 'Code for Communities' — Resilience"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = EMERALD
    p3.alignment = PP_ALIGN.CENTER
    p3.space_before = Pt(20)

    add_notes(s11, "In summary, VayuKavach-360 shifts disaster response from reactive recovery to proactive pre-landfall protection. We invite you to explore our live prototype and join us in building a cyclone-resilient Bharat. Thank you!")

    output_path = "VayuKavach_360_Pitch_Deck.pptx"
    prs.save(output_path)
    print(f"Successfully generated presentation at: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    create_deck()
