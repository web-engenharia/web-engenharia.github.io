# Imagens da landing

## Preview para redes sociais (og:image / twitter:image)

| Arquivo | Dimensões | Uso |
|---------|-----------|-----|
| `web-engenharia-og.png` | **1200×630 px** | Facebook, LinkedIn, Twitter, WhatsApp — miniaturas de link (fallback) |
| `web-engenharia-og.webp` | **1200×630 px** | Versão WebP da og (menor tamanho, usada no HTML quando suportado) |
| `web-engenharia.png` | 1000×1000 px | Logo original (quadrada) |

## Favicon (`favicon.ico`)

O ficheiro **`../favicon.ico`** (raiz da pasta `landing/`) é o ícone da aba do browser. É gerado a partir do logo quadrado. Para regenerar (remove margem em excesso, recentraliza o logo e mantém tamanhos padrão):

```bash
cd landing && DIM=$(convert images/web-engenharia.png -trim -format "%[fx:max(w,h)]" info:) && convert images/web-engenharia.png -trim -gravity center -background none -extent ${DIM}x${DIM} -define icon:auto-resize=16,32,48,64 favicon.ico
```

O tamanho **1200×630** (proporção 1.91:1) é o recomendado pelas principais plataformas. Imagens quadradas ou com proporção diferente são recortadas e podem cortar o logo.

## Fotos dos nossos engenheiros de software (`desenvolvedores/`)

Os caminhos das fotos estão nos ficheiros `landing/js/desenvolvedores.<locale>.js` (`pt`, `en`, `ja`, `kok`) no campo `foto`. Cada página carrega só o ficheiro do idioma correspondente. Para trocar uma foto, mantenha o mesmo nome ou atualize o caminho em **todos** os ficheiros de locale em que esse cooperado aparece.

| Arquivo em uso | Pessoa |
|----------------|--------|
| `matheusdecamargomarques.jpeg` | Matheus de Camargo Marques |
| `ricardokamisky.png` | Ricardo R. Kaminski |
| `Eduarda Saibert.jpeg` | Eduarda Saibert |
| `Emanuel (キドグチ) Kidoguchi.jpeg` | Emanuel Kidoguchi |
| `ricardopatriani.png` | Ricardo Patriani |
| `kevinmathew.jpeg` | Kevin Mathew |
| `mariocassiano.jpeg` | Mario Cassiano |
| `joaovictorpalhaferreira.jpeg` | João Victor Ferreira Palha |
| `danieloliveira.jpeg` | Daniel Oliveira |
| `karlaguerreiro.jpeg` | Karla Guerreiro |
| `juanisrael.jpeg` | Juan Israel |

**Recomendações**

- Proporção **1:1** (quadrada), por exemplo **400×400 px** ou maior.
- Formato **JPG** (boa compressão) ou **PNG** com fundo neutro.
- Rosto centralizado; evite cortes muito apertados nas bordas.

Enquanto um ficheiro não existir, a página mostra um **placeholder com iniciais** automaticamente.
