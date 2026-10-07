import type { SectionVisual, VisualItem } from "../data/lessons";
import { bi, type Lang } from "../i18n";
import { cn } from "../utils/cn";

function ItemText({ item, lang }: { item: VisualItem; lang: Lang }) {
  return (
    <>
      <strong>{bi(item.label, lang)}</strong>
      {item.value && <code>{bi(item.value, lang)}</code>}
      {item.detail && <span>{bi(item.detail, lang)}</span>}
    </>
  );
}

function NetworkGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  const nodes = items.slice(0, 6).map((item, index, array) => ({
    item,
    x: array.length < 4 ? 96 + index * 138 : 65 + index * (470 / Math.max(1, array.length - 1)),
    y: index % 2 === 0 ? 64 : 126,
  }));

  return (
    <svg className="dfir-network" viewBox="0 0 600 240" role="img" aria-label={lang === "en" ? "Network evidence diagram" : "Διάγραμμα δικτυακών στοιχείων"}>
      <defs>
        <linearGradient id="dfir-network-line" x1="0" x2="1">
          <stop offset="0" stopColor="#22d3ee" stopOpacity=".25" />
          <stop offset=".5" stopColor="#22d3ee" stopOpacity=".9" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity=".4" />
        </linearGradient>
      </defs>
      {nodes.slice(0, -1).map((node, index) => {
        const next = nodes[index + 1];
        return <path key={index} d={`M ${node.x} ${node.y} C ${node.x + 45} ${node.y}, ${next.x - 45} ${next.y}, ${next.x} ${next.y}`} className="dfir-network__link" />;
      })}
      {nodes.map(({ item, x, y }, index) => (
        <g key={index} className={cn("dfir-network__node", `tone-${item.tone || "muted"}`)}>
          <circle cx={x} cy={y} r="23" />
          <circle className="dfir-network__pulse" cx={x} cy={y} r="29" />
          <text x={x} y={y + 4} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
          <foreignObject x={x - 62} y={y + 31} width="124" height="72">
            <div className="dfir-network__label">{bi(item.label, lang)}{item.value && <small>{bi(item.value, lang)}</small>}</div>
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}

function ChainGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-chain">
      {items.map((item, index) => (
        <div className={cn("dfir-chain__step", `tone-${item.tone || "muted"}`)} key={index}>
          <span className="dfir-chain__number">{String(index + 1).padStart(2, "0")}</span>
          <ItemText item={item} lang={lang} />
          {index < items.length - 1 && <i className="dfir-chain__connector" aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function TimelineGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-timeline">
      {items.map((item, index) => (
        <div className={cn("dfir-timeline__event", `tone-${item.tone || "muted"}`)} key={index}>
          <span className="dfir-timeline__mark" />
          <span className="dfir-timeline__index">{bi(item.label, lang)}</span>
          <div className="dfir-timeline__copy">
            <strong>{item.value ? bi(item.value, lang) : bi(item.label, lang)}</strong>
            {item.detail && <span>{bi(item.detail, lang)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TreeGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-tree">
      {items.map((item, index) => (
        <div className={cn("dfir-tree__row", `tone-${item.tone || "muted"}`)} style={{ paddingLeft: `${10 + (item.depth || 0) * 22}px` }} key={index}>
          <span className="dfir-tree__branch">{item.depth ? "└─" : "◆"}</span>
          <ItemText item={item} lang={lang} />
        </div>
      ))}
    </div>
  );
}

function TableGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-table">
      {items.map((item, index) => (
        <div className={cn("dfir-table__row", `tone-${item.tone || "muted"}`)} key={index}>
          <span className="dfir-table__index">{String(index + 1).padStart(2, "0")}</span>
          <span className="dfir-table__label">{bi(item.label, lang)}</span>
          <span className="dfir-table__value">{item.value ? bi(item.value, lang) : "—"}</span>
          {item.detail && <span className="dfir-table__detail">{bi(item.detail, lang)}</span>}
        </div>
      ))}
    </div>
  );
}

function LayerGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-layers">
      {items.map((item, index) => (
        <div className={cn("dfir-layer", `tone-${item.tone || "muted"}`)} style={{ marginLeft: `${index * 13}px` }} key={index}>
          <span className="dfir-layer__index">L{String(index).padStart(2, "0")}</span>
          <span className="dfir-layer__content"><ItemText item={item} lang={lang} /></span>
          <span className="dfir-layer__state">{index === 0 ? "BASE" : "DELTA"}</span>
        </div>
      ))}
    </div>
  );
}

function SpectrumGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  const bars = Array.from({ length: 72 }, (_, index) => {
    const envelope = Math.abs(Math.sin(index * 0.38) * Math.cos(index * 0.12));
    const signal = index > 20 && index < 48 ? Math.abs(Math.sin(index * 1.8)) * 0.7 : 0;
    return 8 + envelope * 18 + signal * 35;
  });
  return (
    <div className="dfir-spectrum">
      <div className="dfir-spectrum__readout">
        {items.map((item, index) => <span key={index}><b>{bi(item.label, lang)}</b>{item.value && <code>{bi(item.value, lang)}</code>}</span>)}
      </div>
      <div className="dfir-spectrum__axis"><span>0 Hz</span><span>1.2 kHz marker</span><span>4.2 sec</span></div>
      <div className="dfir-spectrum__bars" aria-label={lang === "en" ? "Illustrative audio spectrum" : "Ενδεικτικό ακουστικό φάσμα"}>
        {bars.map((height, index) => <i key={index} style={{ height: `${height}px`, animationDelay: `${(index % 12) * -0.13}s` }} />)}
      </div>
    </div>
  );
}

function HexGraphic({ items, lang }: { items: VisualItem[]; lang: Lang }) {
  return (
    <div className="dfir-hex-view">
      {items.map((item, index) => (
        <div className={cn("dfir-hex-row", `tone-${item.tone || "muted"}`)} key={index}>
          <span className="dfir-hex-row__offset">{`0x${(index * 8).toString(16).padStart(4, "0")}`}</span>
          <code>{bi(item.value || item.label, lang)}</code>
          <span>{item.detail && bi(item.detail, lang)}</span>
        </div>
      ))}
    </div>
  );
}

export default function DfirVisual({ visual, lang }: { visual: SectionVisual; lang: Lang }) {
  return (
    <figure className={cn("dfir-visual", `dfir-visual--${visual.kind}`)}>
      <figcaption className="dfir-visual__caption">
        <span><i />{bi(visual.title, lang)}</span>
        {visual.caption && <small>{bi(visual.caption, lang)}</small>}
      </figcaption>
      {visual.kind === "network" ? <NetworkGraphic items={visual.items} lang={lang} />
        : visual.kind === "chain" ? <ChainGraphic items={visual.items} lang={lang} />
          : visual.kind === "timeline" ? <TimelineGraphic items={visual.items} lang={lang} />
            : visual.kind === "tree" || visual.kind === "memory" || visual.kind === "document" ? <TreeGraphic items={visual.items} lang={lang} />
              : visual.kind === "layers" ? <LayerGraphic items={visual.items} lang={lang} />
                    : visual.kind === "spectrum" ? <SpectrumGraphic items={visual.items} lang={lang} />
                      : visual.kind === "hex" ? <HexGraphic items={visual.items} lang={lang} />
                  : <TableGraphic items={visual.items} lang={lang} />}
    </figure>
  );
}