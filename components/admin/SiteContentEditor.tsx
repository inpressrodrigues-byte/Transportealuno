"use client";

import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  CompanySettings,
  SiteContentSettings,
  SiteFaqItem,
  SiteSpecItem,
  SiteTestimonialItem,
  SiteTextItem,
} from "@/lib/app-types";

export type SiteAssetKind = "business-card" | "driver-photo";

type ListKey =
  | "driverHighlights"
  | "vanSpecs"
  | "vanFeatures"
  | "safetyItems"
  | "testimonialItems"
  | "faqItems";

type ListItem = SiteTextItem | SiteSpecItem | SiteTestimonialItem | SiteFaqItem;

export function SiteContentEditor({
  value,
  saving,
  onChange,
  onSave,
  onAssetUpload,
  onAssetRemove,
}: {
  value: CompanySettings;
  saving: string;
  onChange: (value: CompanySettings) => void;
  onSave: () => void;
  onAssetUpload: (kind: SiteAssetKind, file: File) => void;
  onAssetRemove: (kind: SiteAssetKind) => void;
}) {
  const content = value.siteContent;

  const setContent = (next: SiteContentSettings) => {
    onChange({ ...value, siteContent: next });
  };

  const updateBlock = (key: keyof SiteContentSettings, changes: Record<string, string>) => {
    setContent({
      ...content,
      [key]: { ...(content[key] as object), ...changes },
    });
  };

  const updateListItem = (key: ListKey, id: string, changes: Record<string, string>) => {
    const items = content[key] as ListItem[];
    setContent({
      ...content,
      [key]: items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    });
  };

  const addListItem = (key: ListKey, item: ListItem) => {
    const items = content[key] as ListItem[];
    setContent({ ...content, [key]: [...items, item] });
  };

  const removeListItem = (key: ListKey, id: string) => {
    const items = content[key] as ListItem[];
    setContent({ ...content, [key]: items.filter((item) => item.id !== id) });
  };

  return (
    <div className="space-y-9">
      <EditorSection title="Menu" description="Textos exibidos na navegacao principal.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(content.navigation).map(([key, label]) => (
            <EditorText
              key={key}
              label={navigationLabels[key] || key}
              value={label}
              onChange={(next) => updateBlock("navigation", { [key]: next })}
            />
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Capa do site" description="Titulo, apresentacao e botoes da primeira tela.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.hero.eyebrow} onChange={(next) => updateBlock("hero", { eyebrow: next })} />
          <div className="grid grid-cols-2 gap-3">
            <EditorText label="Titulo" value={content.hero.title} onChange={(next) => updateBlock("hero", { title: next })} />
            <EditorText label="Destaque dourado" value={content.hero.accent} onChange={(next) => updateBlock("hero", { accent: next })} />
          </div>
          <EditorTextarea label="Frase principal" value={content.hero.subtitle} onChange={(next) => updateBlock("hero", { subtitle: next })} />
          <EditorTextarea label="Descricao" value={content.hero.description} onChange={(next) => updateBlock("hero", { description: next })} />
          <EditorText label="Botao de contato" value={content.hero.primaryButton} onChange={(next) => updateBlock("hero", { primaryButton: next })} />
          <EditorText label="Botao de bairros" value={content.hero.secondaryButton} onChange={(next) => updateBlock("hero", { secondaryButton: next })} />
        </div>
      </EditorSection>

      <EditorSection title="Quem dirige" description="Foto, apresentacao e qualificacoes exibidas nesta secao.">
        <AssetUploader
          label="Foto de quem dirige"
          asset={value.driverPhoto}
          kind="driver-photo"
          saving={saving === "site-asset-driver-photo"}
          onUpload={onAssetUpload}
          onRemove={onAssetRemove}
        />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.driver.eyebrow} onChange={(next) => updateBlock("driver", { eyebrow: next })} />
          <EditorText label="Titulo" value={content.driver.title} onChange={(next) => updateBlock("driver", { title: next })} />
          <EditorText label="Descricao da foto" value={content.driver.photoAlt} onChange={(next) => updateBlock("driver", { photoAlt: next })} />
          <EditorTextarea label="Apresentacao" value={content.driver.description} onChange={(next) => updateBlock("driver", { description: next })} />
        </div>
        <ListHeader
          title="Qualificacoes"
          onAdd={() => addListItem("driverHighlights", newTextItem("driver"))}
        />
        <TextItemList
          items={content.driverHighlights}
          onChange={(id, changes) => updateListItem("driverHighlights", id, changes)}
          onRemove={(id) => removeListItem("driverHighlights", id)}
        />
      </EditorSection>

      <EditorSection title="Nossa van" description="Titulos, dados tecnicos e informacoes do lado direito.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.van.eyebrow} onChange={(next) => updateBlock("van", { eyebrow: next })} />
          <EditorText label="Titulo" value={content.van.title} onChange={(next) => updateBlock("van", { title: next })} />
        </div>
        <ListHeader title="Dados abaixo das fotos" onAdd={() => addListItem("vanSpecs", newSpecItem())} />
        <SpecItemList
          items={content.vanSpecs}
          onChange={(id, changes) => updateListItem("vanSpecs", id, changes)}
          onRemove={(id) => removeListItem("vanSpecs", id)}
        />
        <ListHeader title="Informacoes do lado direito" onAdd={() => addListItem("vanFeatures", newTextItem("van"))} />
        <TextItemList
          items={content.vanFeatures}
          onChange={(id, changes) => updateListItem("vanFeatures", id, changes)}
          onRemove={(id) => removeListItem("vanFeatures", id)}
        />
      </EditorSection>

      <EditorSection title="Escolas e bairros" description="Cabecalhos e textos das listas publicas.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada das escolas" value={content.schools.eyebrow} onChange={(next) => updateBlock("schools", { eyebrow: next })} />
          <EditorText label="Titulo das escolas" value={content.schools.title} onChange={(next) => updateBlock("schools", { title: next })} />
          <EditorText label="Botao das escolas" value={content.schools.button} onChange={(next) => updateBlock("schools", { button: next })} />
          <EditorText label="Chamada dos bairros" value={content.neighborhoods.eyebrow} onChange={(next) => updateBlock("neighborhoods", { eyebrow: next })} />
          <EditorText label="Titulo dos bairros" value={content.neighborhoods.title} onChange={(next) => updateBlock("neighborhoods", { title: next })} />
          <EditorText label="Titulo da lista" value={content.neighborhoods.listTitle} onChange={(next) => updateBlock("neighborhoods", { listTitle: next })} />
          <EditorTextarea label="Descricao dos bairros" value={content.neighborhoods.description} onChange={(next) => updateBlock("neighborhoods", { description: next })} />
          <EditorText label="Texto quando a lista estiver vazia" value={content.neighborhoods.emptyText} onChange={(next) => updateBlock("neighborhoods", { emptyText: next })} />
        </div>
      </EditorSection>

      <EditorSection title="Seguranca" description="Todos os itens podem ser alterados, adicionados ou removidos.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.safety.eyebrow} onChange={(next) => updateBlock("safety", { eyebrow: next })} />
          <EditorText label="Titulo" value={content.safety.title} onChange={(next) => updateBlock("safety", { title: next })} />
          <EditorTextarea label="Descricao" value={content.safety.description} onChange={(next) => updateBlock("safety", { description: next })} />
        </div>
        <ListHeader title="Itens de seguranca" onAdd={() => addListItem("safetyItems", newTextItem("safety"))} />
        <TextItemList
          items={content.safetyItems}
          onChange={(id, changes) => updateListItem("safetyItems", id, changes)}
          onRemove={(id) => removeListItem("safetyItems", id)}
        />
      </EditorSection>

      <EditorSection title="Depoimentos" description="Cadastre somente depoimentos autorizados para publicacao.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.testimonials.eyebrow} onChange={(next) => updateBlock("testimonials", { eyebrow: next })} />
          <EditorText label="Titulo" value={content.testimonials.title} onChange={(next) => updateBlock("testimonials", { title: next })} />
        </div>
        <ListHeader title="Depoimentos publicados" onAdd={() => addListItem("testimonialItems", newTestimonialItem())} />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {content.testimonialItems.map((item) => (
            <ItemShell key={item.id} onRemove={() => removeListItem("testimonialItems", item.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <EditorText label="Nome" value={item.name} onChange={(next) => updateListItem("testimonialItems", item.id, { name: next })} />
                <EditorText label="Identificacao" value={item.role} onChange={(next) => updateListItem("testimonialItems", item.id, { role: next })} />
              </div>
              <EditorTextarea label="Depoimento" value={item.quote} onChange={(next) => updateListItem("testimonialItems", item.id, { quote: next })} />
            </ItemShell>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Perguntas frequentes" description="Perguntas e respostas exibidas no final da pagina.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada superior" value={content.faq.eyebrow} onChange={(next) => updateBlock("faq", { eyebrow: next })} />
          <EditorText label="Titulo" value={content.faq.title} onChange={(next) => updateBlock("faq", { title: next })} />
        </div>
        <ListHeader title="Perguntas publicadas" onAdd={() => addListItem("faqItems", newFaqItem())} />
        <div className="space-y-4">
          {content.faqItems.map((item) => (
            <ItemShell key={item.id} onRemove={() => removeListItem("faqItems", item.id)}>
              <EditorText label="Pergunta" value={item.question} onChange={(next) => updateListItem("faqItems", item.id, { question: next })} />
              <EditorTextarea label="Resposta" value={item.answer} onChange={(next) => updateListItem("faqItems", item.id, { answer: next })} />
            </ItemShell>
          ))}
        </div>
      </EditorSection>

      <EditorSection title="Contato e rodape" description="Textos finais, cidade e links das redes sociais.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Chamada do contato" value={content.contact.eyebrow} onChange={(next) => updateBlock("contact", { eyebrow: next })} />
          <EditorText label="Titulo do contato" value={content.contact.title} onChange={(next) => updateBlock("contact", { title: next })} />
          <EditorText label="Destaque" value={content.contact.kicker} onChange={(next) => updateBlock("contact", { kicker: next })} />
          <EditorText label="Cidade" value={content.contact.city} onChange={(next) => updateBlock("contact", { city: next })} />
          <EditorTextarea label="Frase principal" value={content.contact.headline} onChange={(next) => updateBlock("contact", { headline: next })} />
          <EditorTextarea label="Descricao" value={content.contact.description} onChange={(next) => updateBlock("contact", { description: next })} />
          <EditorText label="Texto do botao de ligar" value={content.contact.callButton} onChange={(next) => updateBlock("contact", { callButton: next })} />
          <EditorText label="Titulo das redes sociais" value={content.contact.socialLabel} onChange={(next) => updateBlock("contact", { socialLabel: next })} />
          <EditorText label="Rotulo do telefone" value={content.contact.phoneLabel} onChange={(next) => updateBlock("contact", { phoneLabel: next })} />
          <EditorText label="Rotulo do WhatsApp" value={content.contact.whatsappLabel} onChange={(next) => updateBlock("contact", { whatsappLabel: next })} />
          <EditorText label="Rotulo da cidade" value={content.contact.cityLabel} onChange={(next) => updateBlock("contact", { cityLabel: next })} />
          <EditorText label="Instagram" value={content.contact.instagramUrl} onChange={(next) => updateBlock("contact", { instagramUrl: next })} />
          <EditorText label="Facebook" value={content.contact.facebookUrl} onChange={(next) => updateBlock("contact", { facebookUrl: next })} />
          <EditorTextarea label="Descricao do rodape" value={content.footer.description} onChange={(next) => updateBlock("footer", { description: next })} />
          <EditorText label="Coluna Navegacao" value={content.footer.navigationTitle} onChange={(next) => updateBlock("footer", { navigationTitle: next })} />
          <EditorText label="Coluna Institucional" value={content.footer.institutionalTitle} onChange={(next) => updateBlock("footer", { institutionalTitle: next })} />
          <EditorText label="Titulo da Area do Cliente" value={content.footer.clientAreaTitle} onChange={(next) => updateBlock("footer", { clientAreaTitle: next })} />
          <EditorTextarea label="Descricao da Area do Cliente" value={content.footer.clientAreaDescription} onChange={(next) => updateBlock("footer", { clientAreaDescription: next })} />
          <EditorText label="Botao da Area do Cliente" value={content.footer.clientAreaButton} onChange={(next) => updateBlock("footer", { clientAreaButton: next })} />
          <EditorText label="Texto de direitos" value={content.footer.rightsText} onChange={(next) => updateBlock("footer", { rightsText: next })} />
          <EditorText label="Prefixo do documento" value={content.footer.documentPrefix} onChange={(next) => updateBlock("footer", { documentPrefix: next })} />
        </div>
      </EditorSection>

      <EditorSection title="Assistente do WhatsApp" description="Textos, perguntas e respostas automaticas do botao flutuante.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Identificacao do assistente" value={content.assistant.subtitle} onChange={(next) => updateBlock("assistant", { subtitle: next })} />
          <EditorText label="Opcao inicial" value={content.assistant.startButton} onChange={(next) => updateBlock("assistant", { startButton: next })} />
          <EditorTextarea label="Saudacao" value={content.assistant.greeting} onChange={(next) => updateBlock("assistant", { greeting: next })} />
          <EditorTextarea label="Orientacao inicial" value={content.assistant.initialHint} onChange={(next) => updateBlock("assistant", { initialHint: next })} />
          <EditorText label="Pergunta do turno" value={content.assistant.shiftQuestion} onChange={(next) => updateBlock("assistant", { shiftQuestion: next })} />
          <EditorText label="Campo do nome" value={content.assistant.nameLabel} onChange={(next) => updateBlock("assistant", { nameLabel: next })} />
          <EditorText label="Campo do WhatsApp" value={content.assistant.phoneLabel} onChange={(next) => updateBlock("assistant", { phoneLabel: next })} />
          <EditorText label="Pergunta da escola" value={content.assistant.schoolQuestion} onChange={(next) => updateBlock("assistant", { schoolQuestion: next })} />
          <EditorText label="Opcao vazia" value={content.assistant.selectPlaceholder} onChange={(next) => updateBlock("assistant", { selectPlaceholder: next })} />
          <EditorText label="Opcao outra escola" value={content.assistant.otherSchoolOption} onChange={(next) => updateBlock("assistant", { otherSchoolOption: next })} />
          <EditorText label="Campo da outra escola" value={content.assistant.customSchoolLabel} onChange={(next) => updateBlock("assistant", { customSchoolLabel: next })} />
          <EditorText label="Campo do bairro" value={content.assistant.neighborhoodLabel} onChange={(next) => updateBlock("assistant", { neighborhoodLabel: next })} />
          <EditorTextarea label="Escola nao cadastrada" value={content.assistant.customSchoolUnavailable} onChange={(next) => updateBlock("assistant", { customSchoolUnavailable: next })} />
          <EditorTextarea label="Escola nao selecionada" value={content.assistant.schoolRequired} onChange={(next) => updateBlock("assistant", { schoolRequired: next })} />
          <EditorTextarea label="Turno nao atendido" value={content.assistant.schoolShiftUnavailable} onChange={(next) => updateBlock("assistant", { schoolShiftUnavailable: next })} />
          <EditorTextarea label="Bairro nao selecionado" value={content.assistant.neighborhoodRequired} onChange={(next) => updateBlock("assistant", { neighborhoodRequired: next })} />
          <EditorTextarea label="Bairro nao atendido" value={content.assistant.neighborhoodUnavailable} onChange={(next) => updateBlock("assistant", { neighborhoodUnavailable: next })} />
          <EditorTextarea label="Atendimento disponivel" value={content.assistant.available} onChange={(next) => updateBlock("assistant", { available: next })} />
          <EditorText label="Botao de envio" value={content.assistant.sendButton} onChange={(next) => updateBlock("assistant", { sendButton: next })} />
          <EditorText label="Confirmacao do envio" value={content.assistant.sentButton} onChange={(next) => updateBlock("assistant", { sentButton: next })} />
          <EditorTextarea label="Inicio da mensagem enviada" value={content.assistant.messageIntro} onChange={(next) => updateBlock("assistant", { messageIntro: next })} />
        </div>
      </EditorSection>

      <EditorSection title="Cartao de visitas" description="Imagem que podera ser aberta e compartilhada pelo site.">
        <AssetUploader
          label="Modelo do cartao"
          asset={value.businessCard}
          kind="business-card"
          saving={saving === "site-asset-business-card"}
          onUpload={onAssetUpload}
          onRemove={onAssetRemove}
        />
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <EditorText label="Texto do botao na pagina inicial" value={content.businessCard.button} onChange={(next) => updateBlock("businessCard", { button: next })} />
          <EditorText label="Chamada superior" value={content.businessCard.eyebrow} onChange={(next) => updateBlock("businessCard", { eyebrow: next })} />
          <EditorText label="Titulo da pagina do cartao" value={content.businessCard.title} onChange={(next) => updateBlock("businessCard", { title: next })} />
          <EditorTextarea label="Descricao" value={content.businessCard.description} onChange={(next) => updateBlock("businessCard", { description: next })} />
          <EditorText label="Botao para abrir" value={content.businessCard.openButton} onChange={(next) => updateBlock("businessCard", { openButton: next })} />
          <EditorText label="Botao para compartilhar" value={content.businessCard.shareButton} onChange={(next) => updateBlock("businessCard", { shareButton: next })} />
          <EditorText label="Botao para voltar" value={content.businessCard.backButton} onChange={(next) => updateBlock("businessCard", { backButton: next })} />
          <EditorText label="Confirmacao de link copiado" value={content.businessCard.copiedText} onChange={(next) => updateBlock("businessCard", { copiedText: next })} />
          <EditorTextarea label="Aviso sem cartao publicado" value={content.businessCard.unavailableText} onChange={(next) => updateBlock("businessCard", { unavailableText: next })} />
        </div>
      </EditorSection>

      <div className="sticky bottom-3 z-10 flex justify-end border-t border-line bg-white/95 py-4 backdrop-blur dark:border-white/10 dark:bg-[#121211]/95">
        <Button onClick={onSave} disabled={saving === "site-content"}>
          {saving === "site-content" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving === "site-content" ? "Salvando conteudo" : "Salvar todo o site"}
        </Button>
      </div>
    </div>
  );
}

function EditorSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-7 first:border-t-0 first:pt-0 dark:border-white/10">
      <h3 className="text-base font-semibold text-navy dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-mute dark:text-white/55">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EditorText({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-mute dark:text-white/50">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

function EditorTextarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-mute dark:text-white/50">{label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

function ListHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between gap-3">
      <h4 className="text-sm font-semibold text-navy dark:text-white">{title}</h4>
      <Button type="button" size="sm" variant="outlineDark" onClick={onAdd}>
        <Plus size={14} /> Adicionar
      </Button>
    </div>
  );
}

function TextItemList({
  items,
  onChange,
  onRemove,
}: {
  items: SiteTextItem[];
  onChange: (id: string, changes: Record<string, string>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {items.map((item) => (
        <ItemShell key={item.id} onRemove={() => onRemove(item.id)}>
          <EditorText label="Titulo" value={item.title} onChange={(next) => onChange(item.id, { title: next })} />
          <EditorTextarea label="Descricao" value={item.detail} onChange={(next) => onChange(item.id, { detail: next })} />
        </ItemShell>
      ))}
    </div>
  );
}

function SpecItemList({
  items,
  onChange,
  onRemove,
}: {
  items: SiteSpecItem[];
  onChange: (id: string, changes: Record<string, string>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <ItemShell key={item.id} onRemove={() => onRemove(item.id)}>
          <EditorText label="Rotulo" value={item.label} onChange={(next) => onChange(item.id, { label: next })} />
          <EditorText label="Valor" value={item.value} onChange={(next) => onChange(item.id, { value: next })} />
        </ItemShell>
      ))}
    </div>
  );
}

function ItemShell({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative space-y-3 rounded-lg border border-line p-4 pr-12 dark:border-white/10">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-500/10"
        aria-label="Remover item"
        title="Remover item"
      >
        <Trash2 size={15} />
      </button>
      {children}
    </div>
  );
}

function AssetUploader({
  label,
  asset,
  kind,
  saving,
  onUpload,
  onRemove,
}: {
  label: string;
  asset: CompanySettings["businessCard"];
  kind: SiteAssetKind;
  saving: boolean;
  onUpload: (kind: SiteAssetKind, file: File) => void;
  onRemove: (kind: SiteAssetKind) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr] lg:items-center">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-mist dark:border-white/10 dark:bg-white/5">
        {asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={label} className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-mute dark:text-white/45">
            <ImagePlus size={24} />
            <span className="text-xs font-semibold">Nenhuma imagem</span>
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-semibold text-navy dark:text-white">{label}</div>
        <p className="mt-1 text-sm text-mute dark:text-white/55">JPG, PNG ou WEBP com ate 4 MB.</p>
        {asset.fileName && <p className="mt-2 truncate text-xs text-mute dark:text-white/45">{asset.fileName}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sun px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-sun-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={saving}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onUpload(kind, file);
                event.currentTarget.value = "";
              }}
            />
            {saving ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
            {asset.url ? "Substituir imagem" : "Enviar imagem"}
          </label>
          {asset.url && (
            <Button type="button" size="sm" variant="outlineDark" onClick={() => onRemove(kind)} disabled={saving}>
              <Trash2 size={14} /> Remover
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function itemId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function newTextItem(prefix: string): SiteTextItem {
  return { id: itemId(prefix), title: "Novo item", detail: "Edite esta descricao." };
}

function newSpecItem(): SiteSpecItem {
  return { id: itemId("spec"), label: "Informacao", value: "Valor" };
}

function newTestimonialItem(): SiteTestimonialItem {
  return { id: itemId("testimonial"), name: "Nome", role: "Responsavel", quote: "Escreva o depoimento." };
}

function newFaqItem(): SiteFaqItem {
  return { id: itemId("faq"), question: "Nova pergunta", answer: "Escreva a resposta." };
}

const navigationLabels: Record<string, string> = {
  home: "Inicio",
  about: "Sobre",
  neighborhoods: "Bairros",
  schools: "Escolas",
  safety: "Seguranca",
  contact: "Contato",
  clientArea: "Area do Cliente",
};
