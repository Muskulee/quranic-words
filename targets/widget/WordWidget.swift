import SwiftUI
import WidgetKit

// The widget is self-contained: it compiles in the word pool (WidgetWords.swift)
// and precomputes a week of midnight entries, so it refreshes even if the app never runs.
// Day math must match wordOfTheDay() in src/lib/words.ts.

private let appGroup = "group.com.muskulee.quranicwords"

struct WidgetWord: Decodable {
  let ar: String
  let tr: String
  let en: String
  let ur: String
  let id: String

  func meaning(_ lang: String) -> String {
    switch lang {
    case "ur": return ur.isEmpty ? en : ur
    case "id": return id.isEmpty ? en : id
    default: return en
    }
  }
}

private let words: [WidgetWord] = {
  guard
    let data = widgetWordsJSON.data(using: .utf8),
    let list = try? JSONDecoder().decode([WidgetWord].self, from: data),
    !list.isEmpty
  else {
    return [WidgetWord(ar: "ٱللَّهِ", tr: "l-lahi", en: "Allah", ur: "اللہ", id: "Allah")]
  }
  return list
}()

func wordFor(_ date: Date) -> WidgetWord {
  let parts = Calendar.current.dateComponents([.year, .month, .day], from: date)
  var utc = Calendar(identifier: .gregorian)
  utc.timeZone = TimeZone(identifier: "UTC")!
  let dayStart = utc.date(from: parts) ?? date
  let day = Int(floor(dayStart.timeIntervalSince1970 / 86_400))
  return words[((day % words.count) + words.count) % words.count]
}

struct WordEntry: TimelineEntry {
  let date: Date
  let word: WidgetWord
  let lang: String
}

struct Provider: TimelineProvider {
  private var lang: String {
    UserDefaults(suiteName: appGroup)?.string(forKey: "lang") ?? "en"
  }

  func placeholder(in context: Context) -> WordEntry {
    WordEntry(date: .now, word: wordFor(.now), lang: "en")
  }

  func getSnapshot(in context: Context, completion: @escaping (WordEntry) -> Void) {
    completion(WordEntry(date: .now, word: wordFor(.now), lang: lang))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<WordEntry>) -> Void) {
    let cal = Calendar.current
    let today = cal.startOfDay(for: .now)
    var entries = [WordEntry(date: .now, word: wordFor(.now), lang: lang)]
    for offset in 1...7 {
      if let day = cal.date(byAdding: .day, value: offset, to: today) {
        entries.append(WordEntry(date: day, word: wordFor(day), lang: lang))
      }
    }
    completion(Timeline(entries: entries, policy: .atEnd))
  }
}

struct WordWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: WordEntry

  var body: some View {
    switch family {
    case .accessoryInline:
      Text("\(entry.word.ar) · \(entry.word.meaning(entry.lang))")
    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 2) {
        Text(entry.word.ar).font(.title3).bold()
        Text(entry.word.meaning(entry.lang)).font(.caption).lineLimit(2)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    default:
      VStack(spacing: 6) {
        Text("Word of the day").font(.caption2).foregroundStyle(.secondary)
        Text(entry.word.ar).font(.system(size: 34, weight: .semibold)).minimumScaleFactor(0.5)
        Text(entry.word.tr).font(.caption).foregroundStyle(.secondary)
        Text(entry.word.meaning(entry.lang))
          .font(.headline).foregroundStyle(Color("$accent")).multilineTextAlignment(.center).lineLimit(2)
      }
      .padding(8)
    }
  }
}

struct WordWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "WordWidget", provider: Provider()) { entry in
      WordWidgetView(entry: entry)
        .containerBackground(Color("$widgetBackground"), for: .widget)
        .widgetURL(URL(string: "quranicwords://"))
    }
    .configurationDisplayName("Word of the Day")
    .description("One Quran word and its meaning, every day.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
  }
}

@main
struct WordWidgetBundle: WidgetBundle {
  var body: some Widget {
    WordWidget()
  }
}
