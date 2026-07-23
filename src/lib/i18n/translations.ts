export type Lang = 'en' | 'mm'

type Dict = Record<Lang, string>

// Flat, namespaced dictionary for every citizen-app string. Values may
// contain {{placeholders}} resolved via `t(key, params)`.
export const translations: Record<string, Dict> = {
  // Common
  'common.close': { en: 'Close', mm: 'ပိတ်ရန်' },
  'common.optional': { en: '(optional)', mm: '(မဖြစ်မနေမလို)' },
  'common.yes': { en: 'Yes', mm: 'ရှိသည်' },
  'common.no': { en: 'No', mm: 'မရှိပါ' },

  // Language toggle
  'lang.toggleAria': { en: 'Change language', mm: 'ဘာသာစကားပြောင်းရန်' },

  // TopBar
  'topbar.notifications': { en: 'Notifications', mm: 'အသိပေးချက်များ' },
  'topbar.location': { en: 'Current location', mm: 'လက်ရှိတည်နေရာ' },

  // Bottom nav
  'nav.home': { en: 'Home', mm: 'ပင်မ' },
  'nav.map': { en: 'Map', mm: 'မြေပုံ' },
  'nav.ai': { en: 'AI', mm: 'AI' },
  'nav.report': { en: 'Report', mm: 'တိုင်ကြားရန်' },

  // Home page
  'home.welcome': { en: 'Welcome back', mm: 'ပြန်လည်ကြိုဆိုပါတယ်' },
  'home.subtitle': {
    en: "Stay cool — here's what's happening in your city.",
    mm: 'အေးဆေးနေပါ — သင့်မြို့တွင် ဖြစ်ပျက်နေသည်များကို ကြည့်ရှုပါ။'
  },
  'home.cityNow': { en: 'Your city, right now', mm: 'သင့်မြို့၊ ယခုအချိန်' },
  'home.heatRisk': { en: '{{level}} heat risk', mm: 'အပူရှိန်အန္တရာယ် — {{level}}' },
  'home.hottestNow': {
    en: 'Hottest right now: {{name}} · {{temp}}°C',
    mm: 'ယခုအပူဆုံးနေရာ — {{name}} · {{temp}}°C'
  },
  'home.outlook': { en: "Today's outlook", mm: 'ယနေ့ ခန့်မှန်းချက်' },
  'home.aiTag': { en: 'AI', mm: 'AI' },
  'home.riskIndex': { en: 'Heat Risk Index', mm: 'အပူရှိန်အန္တရာယ် ညွှန်းကိန်း' },
  'home.zonesAtRisk': { en: 'Zones at Risk', mm: 'အန္တရာယ်ရှိသော နေရာများ' },
  'home.ofTrackedZones': {
    en: 'of {{count}} tracked zones',
    mm: 'စောင့်ကြည့်နေသော နေရာ {{count}} ခုအနက်'
  },
  'home.zonesNearYou': { en: 'Zones near you', mm: 'သင့်အနီးရှိ နေရာများ' },
  'home.viewMap': { en: 'View map', mm: 'မြေပုံကြည့်ရန်' },
  'home.noZoneData': { en: 'No zone data available yet.', mm: 'နေရာအချက်အလက် မရရှိသေးပါ။' },
  'home.comingSoon': {
    en: 'Real-time alerts and personalized recommendations coming soon.',
    mm: 'အချိန်နှင့်တစ်ပြေးညီ သတိပေးချက်များနှင့် ကိုယ်ပိုင်အကြံပြုချက်များ မကြာမီ လာမည်။'
  },

  // Risk level labels (Home hero / risk index)
  'risk.low': { en: 'Cool', mm: 'အေးမြ' },
  'risk.moderate': { en: 'Moderate', mm: 'အလယ်အလတ်' },
  'risk.high': { en: 'Hot', mm: 'ပူပြင်း' },
  'risk.severe': { en: 'Extreme', mm: 'အလွန်ပူပြင်း' },

  // Home quick links
  'home.link.heatMap.label': { en: 'Heat Map', mm: 'အပူပြေမြေပုံ' },
  'home.link.heatMap.desc': {
    en: 'View live zone temperatures',
    mm: 'အချိန်နှင့်တစ်ပြေးညီ အပူချိန်များကြည့်ရန်'
  },
  'home.link.coolingCenters.label': { en: 'Cooling Centers', mm: 'အအေးခံစခန်းများ' },
  'home.link.coolingCenters.desc': {
    en: 'Find nearby cool spaces',
    mm: 'အနီးရှိ အေးမြသောနေရာများ ရှာရန်'
  },
  'home.link.aiAnalysis.label': { en: 'AI Analysis', mm: 'AI ခွဲခြမ်းစိတ်ဖြာမှု' },
  'home.link.aiAnalysis.desc': {
    en: 'Get heat risk insights',
    mm: 'အပူရှိန်အန္တရာယ် ထိုးထွင်းသိမြင်ချက်ရယူရန်'
  },
  'home.link.report.label': { en: 'Report', mm: 'တိုင်ကြားရန်' },
  'home.link.report.desc': {
    en: 'Report a cooling gap',
    mm: 'အအေးခံနေရာလိုအပ်ချက်ကို တိုင်ကြားရန်'
  },

  // Map page
  'map.loadError': {
    en: "Couldn't load heat zones. Check that the API is running and reachable.",
    mm: 'အပူဇုန်များကို ဖွင့်၍မရပါ။ API ကို စစ်ဆေးပါ။'
  },
  'map.tapHint': {
    en: 'Tap a zone marker on the map to see its temperature, risk level, and trend.',
    mm: 'မြေပုံပေါ်ရှိ နေရာအမှတ်အသားကို နှိပ်ပြီး အပူချိန်၊ အန္တရာယ်အဆင့်နှင့် လမ်းကြောင်းကို ကြည့်ပါ။'
  },

  // Live risk ticker (word order flips by language, see LiveRiskTicker.tsx —
  // the mm prefix phrase is rendered separately, this is just the classifier)
  'ticker.suffixOne': { en: 'zone at high risk right now', mm: 'ခု' },
  'ticker.suffixMany': { en: 'zones at high risk right now', mm: 'ခု' },

  // Map legend + markers
  'legend.low': { en: 'Low', mm: 'အနည်း' },
  'legend.moderate': { en: 'Moderate', mm: 'အလတ်' },
  'legend.high': { en: 'High', mm: 'အများ' },
  'legend.severe': { en: 'Severe', mm: 'အလွန်များ' },
  'map.zoneMarkerAria': { en: '{{name}}, {{risk}} risk, {{temp}}°C', mm: '{{name}}၊ {{risk}}၊ {{temp}}°C' },
  'map.sponsored': { en: 'Sponsored', mm: 'ကြီးမှူးသူ ရှိသည်' },
  'map.yourLocation': { en: 'Your location', mm: 'သင့်တည်နေရာ' },
  'map.searchFromHere': { en: 'Search from this point', mm: 'ဤနေရာမှ ရှာဖွေရန်' },

  // Zone detail panel
  'zone.loading': { en: 'Loading zone details…', mm: 'နေရာအသေးစိတ်ကို ဖွင့်နေသည်…' },
  'zone.risk.low': { en: 'Low risk', mm: 'အန္တရာယ်နည်း' },
  'zone.risk.moderate': { en: 'Moderate risk', mm: 'အန္တရာယ် အလယ်အလတ်' },
  'zone.risk.high': { en: 'High risk', mm: 'အန္တရာယ်များ' },
  'zone.risk.severe': { en: 'Severe risk', mm: 'အန္တရာယ် အလွန်များ' },
  'zone.closeAria': { en: 'Close zone detail', mm: 'နေရာအသေးစိတ်ကို ပိတ်ရန်' },
  'zone.currentTemp': { en: 'Current temp', mm: 'လက်ရှိအပူချိန်' },
  'zone.greenCover': { en: 'Green cover', mm: 'စိမ်းလန်းမှု ဖုံးအုပ်မှု' },
  'zone.popDensity': { en: 'Pop. density', mm: 'လူဦးရေ သိပ်သည်းမှု' },
  'zone.trend24h': { en: '24h trend', mm: '၂၄ နာရီ လမ်းကြောင်း' },

  // Cooling centers page
  'cooling.filter.all': { en: 'All', mm: 'အားလုံး' },
  'cooling.filter.coolingCenters': { en: '❄️ Cooling centers', mm: '❄️ အအေးခံစခန်းများ' },
  'cooling.filter.waterStations': { en: '💧 Water stations', mm: '💧 ရေဌာနများ' },
  'cooling.title': { en: 'Find a cooling center', mm: 'အအေးခံစခန်း ရှာရန်' },
  'cooling.subtitle': {
    en: 'Nearest air-conditioned spaces open right now.',
    mm: 'အနီးဆုံး လေအေးပေးစက်ဖွင့်ထားသော နေရာများ။'
  },
  'cooling.locating': { en: 'Locating…', mm: 'တည်နေရာရှာနေသည်…' },
  'cooling.useMyLocation': { en: 'Use my location', mm: 'ကျွန်ုပ်၏တည်နေရာသုံးရန်' },
  'cooling.geoUnsupported': {
    en: 'Geolocation is not supported in this browser.',
    mm: 'ဤဘရောက်ဇာတွင် တည်နေရာဝန်ဆောင်မှု မရရှိပါ။'
  },
  'cooling.geoDenied': {
    en: 'Location access was denied. Drop a pin on the map instead.',
    mm: 'တည်နေရာခွင့်ပြုချက် ငြင်းပယ်ခံရသည်။ မြေပုံပေါ်တွင် အမှတ်အသားချထားပါ။'
  },
  'cooling.orClickHint': {
    en: 'Or click a point on the map to drop a pin.',
    mm: 'သို့မဟုတ် မြေပုံပေါ်တွင် နေရာတစ်ခုနှိပ်၍ အမှတ်အသားချပါ။'
  },
  'cooling.pinResultsHint': {
    en: 'Showing results near your dropped pin.',
    mm: 'သင်ချထားသော အမှတ်အနီးရှိ ရလဒ်များကို ပြသနေသည်။'
  },
  'cooling.useMyLocationInstead': {
    en: 'Use my location instead',
    mm: 'ကျွန်ုပ်၏တည်နေရာကို အစားထိုးသုံးရန်'
  },
  'cooling.searching': { en: 'Searching nearby…', mm: 'အနီးအနားရှာနေသည်…' },
  'cooling.shareLocationHint': {
    en: 'Share your location to see ranked results here.',
    mm: 'အဆင့်သတ်မှတ်ထားသော ရလဒ်များကိုကြည့်ရန် သင့်တည်နေရာကို မျှဝေပါ။'
  },
  'cooling.type.waterStation': { en: 'Water station', mm: 'ရေဌာန' },
  'cooling.type.coolingCenter': { en: 'Cooling center', mm: 'အအေးခံစခန်း' },
  'cooling.sponsoredBy': { en: 'Sponsored by {{name}}', mm: '{{name}} မှ ကြီးမှူးသည်' },
  'cooling.hours': { en: 'Hours', mm: 'ဖွင့်ချိန်' },
  'cooling.capacity': { en: 'Capacity', mm: 'ဆံ့နိုင်စွမ်း' },
  'cooling.contact': { en: 'Contact', mm: 'ဆက်သွယ်ရန်' },
  'cooling.checkingRoute': { en: 'Checking route safety…', mm: 'လမ်းကြောင်းလုံခြုံမှု စစ်ဆေးနေသည်…' },
  'cooling.safety.safe': { en: '✅ Safe route', mm: '✅ လုံခြုံသောလမ်းကြောင်း' },
  'cooling.safety.caution': {
    en: '⚠️ Passes through a moderate-risk zone',
    mm: '⚠️ အန္တရာယ်အလတ်စားနေရာကို ဖြတ်သန်းသည်'
  },
  'cooling.safety.risky': {
    en: '🔥 Passes through high-risk zone(s)',
    mm: '🔥 အန္တရာယ်များသောနေရာများကို ဖြတ်သန်းသည်'
  },
  'cooling.safety.unknown': { en: 'Route safety unknown', mm: 'လမ်းကြောင်းလုံခြုံမှု မသိရသေးပါ' },
  'cooling.safety.tooltip': {
    en: 'Estimated from zone risk data along a direct path, not precise shade routing',
    mm: 'တိုက်ရိုက်လမ်းကြောင်းအတိုင်း ဇုန်အန္တရာယ်အချက်အလက်ဖြင့် ခန့်မှန်းထားခြင်းဖြစ်ပြီး တိကျသောအရိပ်လမ်းကြောင်းမဟုတ်ပါ'
  },

  // Peak hours banner
  'peak.title': { en: 'Peak heat hours', mm: 'အပူအထွတ်အထိပ်ချိန်' },
  'peak.body': {
    en: '— avoid going outside if possible (12:30–3:30 PM).',
    mm: '— ဖြစ်နိုင်ပါက အပြင်မထွက်ပါနှင့် (12:30–3:30 PM)။'
  },
  'peak.dismissAria': { en: 'Dismiss', mm: 'ပယ်ဖျက်ရန်' },

  // Hydration reminder
  'hydration.on': { en: '💧 Hydration reminders on', mm: '💧 ရေသောက်သတိပေးချက် ဖွင့်ထားသည်' },
  'hydration.off': { en: 'Remind me to hydrate', mm: 'ရေသောက်ဖို့ သတိပေးပါ' },
  'hydration.toast': {
    en: '💧 Time to drink some water — stay ahead of the heat.',
    mm: '💧 ရေသောက်ချိန်ရောက်ပါပြီ — အပူရှိန်ကို ကြိုတင်ကာကွယ်ပါ။'
  },

  // SOS button
  'sos.aria': { en: 'Send heat emergency alert', mm: 'အပူရှိန်အရေးပေါ်သတိပေးချက် ပို့ရန်' },
  'sos.label': { en: 'SOS', mm: 'SOS' },
  'sos.locating': { en: 'Finding your location…', mm: 'သင့်တည်နေရာရှာနေသည်…' },
  'sos.sending': { en: 'Sending your alert…', mm: 'သင့်သတိပေးချက်ပို့နေသည်…' },
  'sos.sentTitle': { en: 'Help request sent', mm: 'အကူအညီတောင်းဆိုချက် ပို့ပြီးပါပြီ' },
  'sos.sentBody': {
    en: "Your location has been shared. While you wait, consider heading to the nearest cooling center if you're able to move safely.",
    mm: 'သင့်တည်နေရာကို မျှဝေပြီးပါပြီ။ စောင့်ဆိုင်းနေစဉ် လုံခြုံစွာရွှေ့နိုင်ပါက အနီးဆုံးအအေးခံစခန်းသို့ သွားရန် စဉ်းစားပါ။'
  },
  'sos.errorTitle': { en: "Couldn't send your alert", mm: 'သင့်သတိပေးချက် ပို့၍မရပါ' },
  'sos.errorBody': {
    en: 'Please enable location access, or call local emergency services directly if this is urgent.',
    mm: 'ကျေးဇူးပြု၍ တည်နေရာခွင့်ပြုချက်ဖွင့်ပါ၊ သို့မဟုတ် အရေးပေါ်ဖြစ်ပါက ဒေသန္တရအရေးပေါ်ဌာနကို တိုက်ရိုက်ခေါ်ဆိုပါ။'
  },

  // Report page
  'report.title': { en: 'Report', mm: 'တိုင်ကြားရန်' },
  'report.subtitle': {
    en: "Help planners see what's missing on the ground.",
    mm: 'မြေပြင်တွင် လိုအပ်နေသောအရာများကို စီမံကိန်းရေးဆွဲသူများ သိရှိစေရန် ကူညီပါ။'
  },
  'report.section.location': { en: 'Location', mm: 'တည်နေရာ' },
  'report.section.category': { en: 'Issue category', mm: 'ပြဿနာအမျိုးအစား' },
  'report.section.severity': { en: 'Severity', mm: 'ပြင်းထန်မှုအဆင့်' },
  'report.section.affected': { en: "Who's affected", mm: 'မည်သူများ ထိခိုက်သနည်း' },
  'report.section.description': { en: 'Description', mm: 'ဖော်ပြချက်' },
  'report.section.contact': { en: 'Contact', mm: 'ဆက်သွယ်ရန်' },
  'report.locating': { en: 'Locating…', mm: 'တည်နေရာရှာနေသည်…' },
  'report.useCurrentLocation': { en: 'Use current location', mm: 'လက်ရှိတည်နေရာသုံးရန်' },
  'report.redetectLocation': { en: 'Re-detect my location', mm: 'တည်နေရာပြန်ရှာရန်' },
  'report.geoUnsupported': {
    en: 'Geolocation is not supported in this browser.',
    mm: 'ဤဘရောက်ဇာတွင် တည်နေရာဝန်ဆောင်မှု မရရှိပါ။'
  },
  'report.geoDenied': {
    en: 'Location access was denied. You can still type an address manually.',
    mm: 'တည်နေရာခွင့်ပြုချက် ငြင်းပယ်ခံရသည်။ လိပ်စာကို ကိုယ်တိုင်ရိုက်ထည့်နိုင်ပါသည်။'
  },
  'report.addressPlaceholder': {
    en: 'Address (auto-filled once located, editable)',
    mm: 'လိပ်စာ (တည်နေရာရှာပြီးလျှင် အလိုအလျောက်ဖြည့်မည်၊ ပြင်ဆင်နိုင်သည်)'
  },
  'report.landmarkPlaceholder': {
    en: 'Landmark note, e.g. "near Jollibee Katipunan" (optional)',
    mm: 'အနီးအနားအမှတ်တံဆိပ်၊ ဥပမာ "Jollibee Katipunan အနီးတွင်" (မဖြစ်မနေမလို)'
  },
  'report.descriptionPlaceholder': {
    en: 'Anything else officials should know?',
    mm: 'အာဏာပိုင်များ သိသင့်သည့် အခြားအချက်များ ရှိပါသလား။'
  },
  'report.dateTime': { en: 'Date & time', mm: 'ရက်စွဲနှင့်အချိန်' },
  'report.anonymous': { en: 'Report anonymously', mm: 'အမည်မဖော်ဘဲ တိုင်ကြားရန်' },
  'report.notify': { en: 'Notify me of updates', mm: 'အပ်ဒိတ်များအသိပေးပါ' },
  'report.emailPlaceholder': { en: 'Email address', mm: 'အီးမေးလ်လိပ်စာ' },
  'report.phonePlaceholder': { en: 'Phone number (optional)', mm: 'ဖုန်းနံပါတ် (မဖြစ်မနေမလို)' },
  'report.submit': { en: 'Submit report', mm: 'တိုင်ကြားချက်ပို့ရန်' },
  'report.submitting': { en: 'Submitting…', mm: 'ပို့နေသည်…' },
  'report.submitHint': {
    en: 'Add a photo, confirm a location, and pick an issue category to submit.',
    mm: 'ပို့ရန်အတွက် ဓာတ်ပုံထည့်ပါ၊ တည်နေရာအတည်ပြုပါ၊ ပြဿနာအမျိုးအစား ရွေးပါ။'
  },
  'report.myReports': { en: 'My Reports', mm: 'ကျွန်ုပ်၏ တိုင်ကြားချက်များ' },
  'report.thanks': { en: "Thanks — that's on the record.", mm: 'ကျေးဇူးတင်ပါသည် — မှတ်တမ်းတင်ပြီးပါပြီ။' },
  'report.plannersNote': {
    en: 'Planners can see this in their priority queue.',
    mm: 'စီမံကိန်းရေးဆွဲသူများသည် ၎င်းကို ဦးစားပေးစာရင်းတွင် တွေ့မြင်နိုင်ပါသည်။'
  },
  'report.submitAnother': { en: 'Submit another', mm: 'နောက်တစ်ခုထပ်ပို့ရန်' },

  // Photo upload
  'photo.label': { en: 'Photos', mm: 'ဓာတ်ပုံများ' },
  'photo.upToThree': { en: '(up to 3)', mm: '(၃ ပုံအထိ)' },
  'photo.removeAria': { en: 'Remove photo', mm: 'ဓာတ်ပုံဖျက်ရန်' },
  'photo.add': { en: 'Add photo', mm: 'ဓာတ်ပုံထည့်ရန်' },
  'photo.analyzing': { en: 'Analyzing photos…', mm: 'ဓာတ်ပုံများ ခွဲခြမ်းစိတ်ဖြာနေသည်…' },
  'photo.aiAnalysis': { en: 'AI analysis', mm: 'AI ခွဲခြမ်းစိတ်ဖြာမှု' },
  'photo.surface': { en: 'Surface:', mm: 'မျက်နှာပြင်:' },
  'photo.shadeCover': { en: 'Shade cover:', mm: 'အရိပ်ဖုံးအုပ်မှု:' },
  'photo.visibleDamage': { en: 'Visible damage:', mm: 'မြင်ရသောပျက်စီးမှု:' },
  'photo.surfaceType.asphalt': { en: 'Asphalt', mm: 'အက်စဖော (တာကုတ်)' },
  'photo.surfaceType.concretePavement': { en: 'Concrete pavement', mm: 'ကွန်ကရစ် လမ်းမျက်နှာပြင်' },
  'photo.surfaceType.mixedAsphaltSoil': { en: 'Mixed (asphalt + bare soil)', mm: 'စပ်ရောပါ (တာကုတ် + မြေဩင်း)' },
  'photo.surfaceType.concrete': { en: 'Concrete', mm: 'ကွန်ကရစ်' },

  // Location pin map
  'location.dragHint': { en: 'Drag the pin to adjust', mm: 'ချိန်ညှိရန် အမှတ်အသားကိုဆွဲပါ' },

  // Severity selector
  'severity.label': { en: 'Severity level', mm: 'ပြင်းထန်မှုအဆင့်' },
  'severity.aiSuggests': { en: 'AI suggests: {{level}}', mm: 'AI အကြံပြုသည် — {{level}}' },
  'severity.low': { en: 'Low', mm: 'နည်း' },
  'severity.medium': { en: 'Medium', mm: 'အလယ်အလတ်' },
  'severity.high': { en: 'High', mm: 'များ' },

  // Issue categories
  'category.noShadeTrees': { en: 'No Shade / Trees', mm: 'အရိပ် / သစ်ပင် မရှိ' },
  'category.brokenShadeStructure': {
    en: 'Broken Shade Structure',
    mm: 'ပျက်စီးနေသော အရိပ်ဖွဲ့စည်းပုံ'
  },
  'category.heatTrappingSurface': { en: 'Heat-Trapping Surface', mm: 'အပူများသော မျက်နှာပြင်' },
  'category.noWaterAccess': { en: 'No Water Access Nearby', mm: 'အနီးတွင် ရေမရ' },
  'category.other': { en: 'Other', mm: 'အခြား' },

  // Affected groups
  'affected.pedestrians': { en: 'Pedestrians', mm: 'လမ်းလျှောက်သူများ' },
  'affected.commuters': {
    en: 'Commuters (bus/jeepney stop)',
    mm: 'ခရီးသွားများ (ဘတ်စ်ကား/ဂျစ်ပနီမှတ်တိုင်)'
  },
  'affected.elderlyPwd': { en: 'Elderly or PWD', mm: 'သက်ကြီးရွယ်အို သို့မဟုတ် မသန်စွမ်း' },
  'affected.children': { en: 'Children', mm: 'ကလေးများ' },
  'affected.vendorsWorkers': {
    en: 'Vendors / outdoor workers',
    mm: 'အရောင်းသည်များ / အပြင်အလုပ်သမားများ'
  },

  // Report status
  'status.pending': { en: 'Pending', mm: 'ဆိုင်းငံ့ထား' },
  'status.underReview': { en: 'Under Review', mm: 'စိစစ်နေဆဲ' },
  'status.actionTaken': { en: 'Action Taken', mm: 'အရေးယူပြီး' },

  // AI page
  'ai.title': { en: 'AI Heat Analysis', mm: 'AI အပူရှိန် ခွဲခြမ်းစိတ်ဖြာမှု' },
  'ai.subtitle': {
    en: 'Machine learning models analyze heat patterns, predict risk zones, and suggest interventions.',
    mm: 'စက်သင်ယူမှု မော်ဒယ်များသည် အပူရှိန်ပုံစံများကို ခွဲခြမ်းစိတ်ဖြာပြီး အန္တရာယ်ရှိသောနေရာများကို ခန့်မှန်း၍ ဖြေရှင်းနည်းများကို အကြံပြုပါသည်။'
  },
  'ai.comingSoon': {
    en: 'AI-powered analysis dashboard coming soon.',
    mm: 'AI ဖြင့် ခွဲခြမ်းစိတ်ဖြာသည့် ဒက်ရှ်ဘုတ် မကြာမီ လာမည်။'
  },

  // Notifications page
  'notifications.title': { en: 'Notifications', mm: 'အသိပေးချက်များ' },
  'notifications.subtitle': {
    en: 'Stay informed about heat alerts and updates.',
    mm: 'အပူရှိန်သတိပေးချက်များနှင့် အပ်ဒိတ်များကို သိရှိပါစေ။'
  }
}
