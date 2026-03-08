# 💰 FinanceFlow — Controle Financeiro Pessoal

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/LocalStorage-4A90D9?style=for-the-badge&logo=databricks&logoColor=white"/>
  <img src="https://img.shields.io/badge/Status-Concluído-34d58f?style=for-the-badge"/>
</p>

> Aplicativo web de controle financeiro pessoal — totalmente responsivo, com persistência de dados, calendário de eventos, gráficos e muito mais. Sem banco de dados, sem back-end: funciona direto no navegador.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Usar](#-como-usar)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Capturas de Tela](#-capturas-de-tela)
- [Próximas Melhorias](#-próximas-melhorias)
- [Autor](#-autor)

---

## 📌 Sobre o Projeto

O **FinanceFlow** nasceu da necessidade de ter uma ferramenta simples, bonita e funcional para acompanhar as finanças pessoais no dia a dia — sem depender de cadastros em serviços externos, sem mensalidade e sem complicação.

O projeto foi construído do zero utilizando apenas **HTML, CSS e JavaScript puro**, com foco em:

- Interface moderna com tema escuro (*dark luxury*)
- Persistência total de dados via `localStorage` — os dados **não somem** ao recarregar a página
- Experiência fluida com animações, transições e feedback visual em tempo real

---

## ✅ Funcionalidades

### 🏠 Dashboard
- Cards com resumo do mês: **Salário**, **Gastos**, **Receitas** e **Total Guardado**
- **Barra de progresso** da meta de economia mensal com porcentagem em tempo real
- **Gráfico de barras** comparando receitas e despesas dos últimos 6 meses
- Lista das **últimas 5 transações** cadastradas

### 💳 Transações
- Cadastro de transações com: descrição, valor, tipo (receita/despesa), categoria, data e observação
- **Edição** e **exclusão** de qualquer transação
- **Filtros** por tipo (Todos / Receitas / Despesas)
- **Busca em tempo real** por descrição ou observação
- Categorias disponíveis: Alimentação, Transporte, Saúde, Lazer, Moradia, Educação, Salário e Outros

### 📅 Calendário
- Navegação mês a mês com visualização completa
- **Pontos coloridos** nos dias que possuem eventos cadastrados
- Painel lateral com os eventos do dia selecionado
- Criação, **edição** e **exclusão** de eventos com tipos: Lembrete, Pagamento, Recebimento e Meta

### ⚙️ Configurações
- Definição do **salário mensal**
- Definição da **meta de economia** mensal
- Botão de **reset completo** dos dados (com confirmação)

### 💾 Persistência de Dados
- Todos os dados (transações, eventos, salário, meta) são salvos no `localStorage` do navegador
- Os dados **persistem entre sessões** — fechar e reabrir o navegador não apaga nada
- Nenhum servidor, banco de dados ou internet necessários para funcionamento

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| **HTML5** | Estrutura semântica da aplicação |
| **CSS3** | Estilização completa com variáveis CSS, Grid, Flexbox e animações |
| **JavaScript ES6+** | Lógica da aplicação, manipulação do DOM e gerenciamento de estado |
| **localStorage API** | Persistência dos dados no navegador |
| **Font Awesome 6** | Biblioteca de ícones |
| **Google Fonts** | Tipografia (Syne + DM Sans) |

---

## 🚀 Como Usar

### Pré-requisitos

Nenhum! Basta ter um navegador moderno instalado (Chrome, Firefox, Edge, Safari).

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/financeflow.git

# Acesse a pasta do projeto
cd financeflow
```

### Execução

Abra o arquivo `index.html` diretamente no navegador:

```bash
# No Linux/Mac
open index.html

# No Windows
start index.html
```

> Ou simplesmente clique duas vezes no arquivo `index.html` no explorador de arquivos.

### Primeiros passos no app

1. Acesse **Configurações** e informe seu **salário mensal** e sua **meta de economia**
2. Volte ao **Dashboard** e veja os cards atualizados
3. Clique em **Nova Transação** para registrar receitas e despesas
4. Use o **Calendário** para cadastrar lembretes e eventos financeiros importantes

---

## 📁 Estrutura de Arquivos

```
financeflow/
│
├── index.html      # Estrutura HTML da aplicação (sidebar, seções, modais)
├── style.css       # Estilos globais, tema dark, responsividade e animações
├── app.js          # Lógica completa: estado, CRUD, renderização, localStorage
└── README.md       # Documentação do projeto
```

### Descrição dos arquivos

**`index.html`**
Contém toda a estrutura da interface: sidebar de navegação, as quatro seções principais (Dashboard, Transações, Calendário, Configurações), os modais de cadastro/edição de transações e eventos, e o componente de toast para notificações.

**`style.css`**
Define o sistema de design completo usando variáveis CSS (`--bg`, `--gold`, `--green`, etc.), o layout responsivo com CSS Grid e Flexbox, animações de entrada (`fadeIn`, `modalIn`), e breakpoints para dispositivos móveis.

**`app.js`**
Gerencia o estado global da aplicação (objeto `state`), implementa o CRUD completo de transações e eventos, controla a navegação entre seções, renderiza todos os componentes dinâmicos (cards, gráficos, listas, calendário) e sincroniza tudo com o `localStorage`.

---

## 📸 Capturas de Tela

| Dashboard | Transações |
|---|---|
| Cards de resumo, barra de meta e gráfico histórico | Lista completa com filtros e busca |

| Calendário | Configurações |
|---|---|
| Navegação mensal com eventos marcados | Definição de salário e meta mensal |

---

## 🔮 Próximas Melhorias

- [ ] Exportação dos dados em `.csv` ou `.xlsx`
- [ ] Gráfico de pizza por categoria de gasto
- [ ] Modo claro (light theme)
- [ ] Notificações de vencimento de eventos
- [ ] Suporte a múltiplos meses de meta
- [ ] PWA (Progressive Web App) para instalação no celular

---

## 👨‍💻 Autor

Feito com dedicação para organizar as finanças de forma simples e eficiente.

Se este projeto te ajudou, deixa uma ⭐ no repositório!

---

<p align="center">
                
</p>



## 👨‍💻 Desenvolvimento

<div align="center">

Desenvolvido com dedicação para uso pessoais e comerciais** 💅

<br/>

<a href="https://github.com/wandersondfarias">
  <img src="https://img.shields.io/badge/GitHub-wandersondfarias-181717?style=for-the-badge&logo=github&labelColor=0e1a14" />
</a>
&nbsp;
<a href="https://www.linkedin.com/in/wandersonfariaswf/">
  <img src="https://img.shields.io/badge/LinkedIn-Wanderson%20de%20Farias-0077B5?style=for-the-badge&logo=linkedin&labelColor=0e1a14" />
</a>

<br/><br/>

<img src="https://img.shields.io/badge/Desenvolvido%20por-Wanderson%20de%20Farias-c9a84c?style=for-the-badge&labelColor=0e1a14" />

</div>

---

## 📜 Licença

Este projeto é de **uso livre** para fins pessoais e comerciais.

---

<div align="center">




<hr>







</div>
























