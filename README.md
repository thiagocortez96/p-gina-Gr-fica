Sistema CMS + Vitrine Integrada

Este projeto consiste no desenvolvimento de um sistema completo de gerenciamento e exibição dinâmica de produtos, dividido em duas aplicações principais: um CMS administrativo e uma página de vitrine integrada. A proposta do projeto foi criar uma arquitetura automatizada e desacoplada, permitindo que o gerenciamento de catálogo aconteça de forma simples, escalável e centralizada.

No CMS administrativo, é realizado todo o cadastro e gerenciamento dos produtos. A aplicação permite registrar informações como nome do produto, quantidade em estoque, materiais utilizados, categorias, custos de produção, valores base e demais informações necessárias para a composição do catálogo. Após o cadastro, os dados são enviados automaticamente para uma planilha do Google Sheets, utilizada como camada intermediária de armazenamento e organização das informações.

O Google Sheets atua como um banco de dados leve e flexível, permitindo o armazenamento estruturado dos produtos e facilitando tanto o controle operacional quanto futuras manipulações dos dados. Essa abordagem torna o gerenciamento mais acessível, além de simplificar atualizações e manutenção do catálogo sem depender diretamente de um banco de dados tradicional.

Após o envio das informações para a planilha, o backend do sistema realiza o processamento automático dos dados. Nesse processo, são feitas validações, tratamentos de inconsistências, padronização das informações e cálculos relacionados às regras de negócio da aplicação. Um dos principais recursos implementados é o cálculo automático da margem de lucro, realizado diretamente no backend para garantir maior segurança, padronização e centralização da lógica de precificação. Depois do processamento, o sistema gera automaticamente um arquivo JSON estruturado contendo todos os produtos atualizados e prontos para consumo no frontend.

A página de vitrine consome esse JSON de forma dinâmica, exibindo automaticamente os produtos cadastrados no CMS sem necessidade de alterações manuais no código da interface. Isso permite que qualquer atualização feita no painel administrativo seja refletida diretamente na vitrine após o processamento dos dados. A aplicação foi desenvolvida com foco em performance, desacoplamento entre frontend e backend e facilidade de escalabilidade para futuras integrações.

A arquitetura do projeto segue um fluxo contínuo onde o produto é cadastrado no CMS, enviado para o Google Sheets, processado pelo backend, transformado em JSON e posteriormente consumido pela vitrine pública. Essa estrutura automatiza completamente o gerenciamento do catálogo e reduz significativamente processos manuais de atualização.

O projeto foi desenvolvido utilizando HTML, CSS, JavaScript e TailwindCSS no frontend, além de Node.js no backend para processamento das informações, cálculos automatizados e geração dinâmica do JSON. Também foi utilizada integração com a Google Sheets API para comunicação entre o CMS e a planilha.

A estrutura foi planejada visando escalabilidade futura, permitindo expansão para recursos como autenticação de usuários, integração com APIs externas, bancos de dados SQL ou NoSQL, dashboards analíticos, sistemas de estoque mais avançados, ERP, marketplaces e gateways de pagamento.

Desenvolvido por Thiago Cortez.
