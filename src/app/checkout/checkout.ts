import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { loadMercadoPago } from '@mercadopago/sdk-js';745
import { environment } from '../../environments/environment';


declare global {
  interface Window {
    MercadoPago: any;
  }
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  imagemUrl?: string;
  estoque: number;
}

interface ItemCarrinho {
  id: number;
  produtoId: number;
  tamanho: string;
  quantidade: number;
}

interface ItemCheckout {
  idDb: number;
  produtoId: number;
  nome: string;
  preco: number;
  tamanho: string;
  quantidade: number;
  imagem: string;
  subtotal: number;
}

interface Endereco {
  id: number;
  rua: string;
  bairro: string;
  cidade: string;
  pais: string;
  principal: boolean;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements OnInit, OnDestroy {

  // =========================================================
  // DADOS DO CHECKOUT
  // =========================================================

  itens: ItemCheckout[] = [];

  endereco: Endereco | null = null;

  metodoPagamento: 'pix' | 'cartao' = 'pix';

  parcelas = 1;

  carregando = true;

  erro = '';

  valorSubtotal = 0;

  valorFrete = 0;

  valorTotal = 0;

  // =========================================================
  // PEDIDO
  // =========================================================

  pedidoCriado = false;

  numeroPedidoCriado: string | null = null;

  // =========================================================
  // PIX
  // =========================================================

  qrCodeBase64: string | null = null;

  qrCode: string | null = null;

  ticketUrl: string | null = null;

  // =========================================================
  // CARTÃO
  // =========================================================

  private mercadoPago: any = null;

  private cardForm: any = null;

  private cardFormInicializado = false;

  // Somente dados tokenizados.
  // Nunca armazenamos número do cartão ou CVV.
  private cardToken: string | null = null;

  private cardPaymentMethodId: string | null = null;

  private cardIssuerId: string | null = null;

  private cardInstallments = 1;

  // Evita duplo clique / envio duplicado
  private processandoPagamentoCartao = false;


  // =========================================================
  // CONSTRUTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}


  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  async ngOnInit(): Promise<void> {

    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/']);
      return;
    }

    await this.inicializarMercadoPago();

    this.carregarCheckout();
  }


  // =========================================================
  // MERCADO PAGO
  // =========================================================

  async inicializarMercadoPago(): Promise<void> {

    try {

      await loadMercadoPago();

      this.mercadoPago = new window.MercadoPago(
        environment.mercadoPagoPublicKey,
        {
          locale: 'pt-BR'
        }
      );

      console.log(
        '💳 Mercado Pago inicializado com sucesso.'
      );

    } catch (error) {

      console.error(
        '❌ Erro ao inicializar Mercado Pago:',
        error
      );

      this.erro =
        'Não foi possível carregar o sistema de pagamento.';
    }
  }


  // =========================================================
  // CARD FORM
  // =========================================================

  inicializarCardForm(): void {

    if (!this.mercadoPago) {

      console.error(
        '❌ Mercado Pago ainda não foi inicializado.'
      );

      this.erro =
        'O sistema de pagamento ainda está carregando.';

      return;
    }


    if (this.cardFormInicializado) {
      return;
    }


    const formCheckout =
      document.getElementById('form-checkout');

    const cardNumber =
      document.getElementById(
        'form-checkout__cardNumber'
      );


    if (!formCheckout || !cardNumber) {

      console.error(
        '❌ Elementos do CardForm ainda não estão no DOM.'
      );

      return;
    }


    console.log(
      '💳 Montando CardForm do Mercado Pago...'
    );


    try {

      this.cardForm =
        this.mercadoPago.cardForm({

          amount:
            Number(this.valorTotal).toFixed(2),

          iframe: true,

          form: {

            id: 'form-checkout',

            cardNumber: {

              id:
                'form-checkout__cardNumber',

              placeholder:
                'Número do cartão'
            },


            expirationDate: {

              id:
                'form-checkout__expirationDate',

              placeholder:
                'MM/AA'
            },


            securityCode: {

              id:
                'form-checkout__securityCode',

              placeholder:
                'CVV'
            },


            cardholderName: {

              id:
                'form-checkout__cardholderName',

              placeholder:
                'Nome do titular'
            },


            issuer: {

              id:
                'form-checkout__issuer',

              placeholder:
                'Banco emissor'
            },


            installments: {

              id:
                'form-checkout__installments',

              placeholder:
                'Parcelas'
            },


            identificationType: {

              id:
                'form-checkout__identificationType',

              placeholder:
                'Tipo de documento'
            },


            identificationNumber: {

              id:
                'form-checkout__identificationNumber',

              placeholder:
                'CPF'
            },


            cardholderEmail: {

              id:
                'form-checkout__cardholderEmail',

              placeholder:
                'E-mail'
            }

          },


          callbacks: {

            // =================================================
            // CARD FORM MONTADO
            // =================================================

            onFormMounted:
              (error: any) => {

                if (error) {

                  console.error(
                    '❌ Erro ao montar CardForm:',
                    error
                  );

                  this.cardFormInicializado =
                    false;

                  this.erro =
                    'Não foi possível carregar o formulário do cartão.';

                  return;
                }


                console.log(
                  '✅ CardForm montado com sucesso!'
                );

                this.cardFormInicializado =
                  true;
              },


            // =================================================
            // SUBMIT REAL DO CARD FORM
            // =================================================

            onSubmit:
              async (event: Event) => {

                event.preventDefault();

                console.log(
                  '💳 SUBMIT REAL DO CARD FORM DETECTADO.'
                );


                try {

                  const data =
                    this.cardForm.getCardFormData();


                  // ===========================================
                  // NÃO LOGAR DADOS SENSÍVEIS
                  // ===========================================

                  console.log(
                    '💳 Resultado da tokenização:',
                    {
                      tokenGerado:
                        Boolean(data?.token),

                      paymentMethodId:
                        data?.paymentMethodId,

                      issuerId:
                        data?.issuerId,

                      installments:
                        data?.installments,

                      identificationType:
                        data?.identificationType,

                      identificationNumberPreenchido:
                        Boolean(
                          data?.identificationNumber
                        ),

                      cardholderEmailPreenchido:
                        Boolean(
                          data?.cardholderEmail
                        )
                    }
                  );


                  // ===========================================
                  // VALIDAR TOKEN
                  // ===========================================

                  if (!data?.token) {

                    console.error(
                      '❌ O submit ocorreu, mas o Mercado Pago não retornou CardToken.'
                    );

                    this.erro =
                      'O Mercado Pago não conseguiu validar o cartão. Confira número, validade, CVV, nome, CPF e e-mail.';

                    return;
                  }


                  // ===========================================
                  // GUARDAR DADOS TOKENIZADOS
                  // ===========================================

                  this.cardToken =
                    data.token;

                  this.cardPaymentMethodId =
                    data.paymentMethodId ||
                    null;

                  this.cardIssuerId =
                    data.issuerId ||
                    null;

                  this.cardInstallments =
                    Number(
                      data.installments
                    ) || 1;


                  this.erro = '';


                  console.log(
                    '✅ CardToken gerado com sucesso.'
                  );


                  // ===========================================
                  // AGORA PROCESSAR PAGAMENTO
                  // ===========================================

                  await this.processarPagamentoCartao(
                    data
                  );


                } catch (error) {

                  console.error(
                    '❌ Erro ao obter dados tokenizados:',
                    error
                  );

                  this.erro =
                    'Não foi possível validar os dados do cartão.';
                }

              },


            // =================================================
            // PROCESSAMENTO DO MERCADO PAGO
            // =================================================

            onFetching:
              (resource: any) => {

                console.log(
                  '⏳ Mercado Pago processando:',
                  resource
                );

              }

          }

        });


      console.log(
        '💳 CardForm criado com sucesso.'
      );


    } catch (error) {

      console.error(
        '❌ Erro ao criar CardForm:',
        error
      );

      this.cardForm = null;

      this.cardFormInicializado =
        false;

      this.erro =
        'Não foi possível carregar o formulário do cartão.';
    }
  }


  // =========================================================
  // PROCESSAR PAGAMENTO CARTÃO
  // =========================================================

 // =========================================================
// PROCESSAR PAGAMENTO CARTÃO
// =========================================================
private async processarPagamentoCartao(
  data: any
): Promise<void> {

  // Evitar envio duplicado
  if (this.processandoPagamentoCartao) {
    console.warn(
      '⚠️ Pagamento com cartão já está sendo processado.'
    );
    return;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    this.erro =
      'Sua sessão expirou. Faça login novamente.';
    return;
  }

  if (!this.cardToken) {
    this.erro =
      'Token do cartão não disponível.';
    return;
  }

  if (!this.cardPaymentMethodId) {
    this.erro =
      'Método de pagamento do cartão não identificado.';
    return;
  }

  // =======================================================
  // BLOQUEAR NOVO ENVIO
  // =======================================================
  this.processandoPagamentoCartao = true;
  this.carregando = true;
  this.erro = '';

  const headers = new HttpHeaders()
    .set(
      'Authorization',
      `Bearer ${token}`
    );

  // =======================================================
  // E-MAIL
  // =======================================================
  const emailPagamento =
    data?.cardholderEmail?.trim() ||
    'test@testuser.com';

  // =======================================================
  // DADOS ENVIADOS AO BACKEND
  // =======================================================
  const dadosPagamento = {

    // Tokenizado pelo Mercado Pago
    token:
      this.cardToken,

    installments:
      Number(
        data?.installments ||
        this.cardInstallments ||
        1
      ),

    paymentMethodId:
      data?.paymentMethodId ||
      this.cardPaymentMethodId,

    issuerId:
      data?.issuerId ||
      this.cardIssuerId ||
      null,

    identificationType:
      data?.identificationType ||
      'CPF',

    identificationNumber:
      data?.identificationNumber,

    // NOVO: enviar e-mail ao backend
    email:
      emailPagamento
  };

  console.log(
    '📤 Enviando pagamento tokenizado para o backend...'
  );

  console.log(
    '📧 E-mail enviado ao backend:',
    emailPagamento
  );

  try {

    const resposta =
      await this.http.post<any>(
        'http://localhost:3000/pedidos/cartao',
        dadosPagamento,
        {
          headers
        }
      ).toPromise();

    console.log(
      '✅ Resposta do pagamento com cartão:',
      resposta
    );

    // =====================================================
    // PEDIDO
    // =====================================================
    this.numeroPedidoCriado =
      resposta?.pedido?.numeroPedido ||
      null;

    // =====================================================
    // STATUS DO PAGAMENTO
    // =====================================================
    const status =
      String(
        resposta?.pagamento?.status ||
        ''
      ).toLowerCase();

    const statusDetail =
      String(
        resposta?.pagamento?.statusDetail ||
        resposta?.pagamento?.status_detail ||
        ''
      ).toLowerCase();

    const statusPagamento =
      String(
        resposta?.pedido?.statusPagamento ||
        ''
      ).toUpperCase();

    console.log(
      '💳 Status recebido:',
      status
    );

    console.log(
      '💳 Status detail recebido:',
      statusDetail
    );

    console.log(
      '📦 Status do pedido:',
      statusPagamento
    );

    // =====================================================
    // PAGAMENTO APROVADO
    // =====================================================
    //
    // Mercado Pago Orders API:
    //
    // status = processed
    // status_detail = accredited
    //
    // Também mantemos suporte para:
    //
    // status = approved
    // statusPagamento = APROVADO
    //
    const pagamentoAprovado =
      status === 'approved' ||
      (
        status === 'processed' &&
        statusDetail === 'accredited'
      ) ||
      statusPagamento === 'APROVADO';

    if (pagamentoAprovado) {

      console.log(
        '🎉 PAGAMENTO COM CARTÃO APROVADO!'
      );

      // Pedido criado com sucesso
      this.pedidoCriado = true;

      // Para de mostrar "Processando pagamento..."
      this.carregando = false;

      this.erro = '';

      // Não existe QR Code para cartão
      this.qrCodeBase64 = null;
      this.qrCode = null;
      this.ticketUrl = null;

      // Token é de uso único.
      // Limpar imediatamente.
      this.cardToken = null;

      return;
    }

    // =====================================================
    // PAGAMENTO RECUSADO
    // =====================================================
    if (
      status === 'rejected' ||
      statusPagamento === 'RECUSADO'
    ) {

      console.warn(
        '❌ PAGAMENTO COM CARTÃO RECUSADO.'
      );

      this.carregando = false;
      this.pedidoCriado = false;

      this.erro =
        this.obterMensagemPagamentoRecusado(
          resposta?.pagamento?.statusDetail ||
          resposta?.pagamento?.status_detail ||
          null
        );

      // Token de uso único
      this.cardToken = null;

      return;
    }

    // =====================================================
    // PAGAMENTO PENDENTE
    // =====================================================
    console.log(
      '⏳ Pagamento com cartão ficou pendente.'
    );

    this.carregando = false;

    this.pedidoCriado = true;

    this.erro =
      'O pagamento foi enviado e está aguardando confirmação.';

    // Token não deve ser reutilizado
    this.cardToken = null;

  } catch (erro: any) {

    console.error(
      '❌ Erro ao processar pagamento com cartão:',
      erro
    );

    this.carregando = false;
    this.pedidoCriado = false;

    const mensagem =
      erro?.error?.mensagem;

    this.erro =
      mensagem ||
      'Não foi possível processar o pagamento com cartão. Verifique os dados e tente novamente.';

    // Token é de uso único
    this.cardToken = null;

  } finally {

    this.processandoPagamentoCartao = false;
  }
}


  // =========================================================
  // MENSAGENS DE RECUSA
  // =========================================================

  private obterMensagemPagamentoRecusado(
    statusDetail: string | null
  ): string {

    switch (statusDetail) {

      case 'cc_rejected_bad_filled_card_number':
        return 'O número do cartão parece estar incorreto.';

      case 'cc_rejected_bad_filled_date':
        return 'A validade do cartão parece estar incorreta.';

      case 'cc_rejected_bad_filled_security_code':
        return 'O código de segurança do cartão parece estar incorreto.';

      case 'cc_rejected_insufficient_amount':
        return 'O pagamento foi recusado por falta de limite ou saldo disponível.';

      case 'cc_rejected_call_for_authorize':
        return 'O pagamento foi recusado. Entre em contato com o banco emissor do cartão.';

      case 'cc_rejected_other_reason':
        return 'O banco emissor recusou o pagamento. Tente outro cartão.';

      default:
        return 'O pagamento foi recusado. Verifique os dados ou tente outro cartão.';
    }
  }


  // =========================================================
  // CARREGAR CHECKOUT
  // =========================================================

  carregarCheckout(): void {

    const token =
      localStorage.getItem('token');


    if (!token) {
      return;
    }


    const headers =
      new HttpHeaders()
        .set(
          'Authorization',
          `Bearer ${token}`
        );


    this.carregando =
      true;

    this.erro = '';


    this.http.get<ItemCarrinho[]>(
      'http://localhost:3000/carrinho',
      {
        headers
      }

    ).subscribe({

      next: (carrinho) => {

        if (!carrinho.length) {

          this.erro =
            'Seu carrinho está vazio.';

          this.carregando =
            false;

          return;
        }


        this.http.get<Produto[]>(
          'http://localhost:3000/produtos'

        ).subscribe({

          next: (produtos) => {

            this.itens =
              carrinho

                .map(item => {

                  const produto =
                    produtos.find(
                      p =>
                        p.id === item.produtoId
                    );


                  if (!produto) {
                    return null;
                  }


                  const preco =
                    Number(
                      produto.preco
                    );


                  const subtotal =
                    preco *
                    item.quantidade;


                  return {

                    idDb:
                      item.id,

                    produtoId:
                      item.produtoId,

                    nome:
                      produto.nome,

                    preco,

                    tamanho:
                      item.tamanho,

                    quantidade:
                      item.quantidade,

                    imagem:
                      produto.imagemUrl ||
                      '/placeholder.png',

                    subtotal

                  };

                })


                .filter(
                  (
                    item
                  ): item is ItemCheckout =>
                    item !== null
                );


            this.calcularTotais();


            this.carregarEndereco(
              headers
            );

          },


          error: () => {

            this.erro =
              'Não foi possível carregar os produtos.';

            this.carregando =
              false;

          }

        });

      },


      error: () => {

        this.erro =
          'Não foi possível carregar seu carrinho.';

        this.carregando =
          false;

      }

    });
  }


  // =========================================================
  // ENDEREÇO
  // =========================================================

  carregarEndereco(
    headers: HttpHeaders
  ): void {

    this.http.get<Endereco[]>(
      'http://localhost:3000/enderecos',
      {
        headers
      }

    ).subscribe({

      next: (enderecos) => {

        this.endereco =
          enderecos.find(
            endereco =>
              endereco.principal
          ) ||

          enderecos[0] ||

          null;


        if (!this.endereco) {

          this.erro =
            'Você precisa cadastrar um endereço de entrega.';
        }


        this.carregando =
          false;
      },


      error: () => {

        this.erro =
          'Não foi possível carregar seu endereço.';

        this.carregando =
          false;
      }

    });
  }


  // =========================================================
  // TOTAIS
  // =========================================================

  calcularTotais(): void {

    this.valorSubtotal =
      this.itens.reduce(
        (
          total,
          item
        ) =>
          total +
          item.subtotal,

        0
      );


    this.valorFrete =
      0;


    this.valorTotal =
      this.valorSubtotal +
      this.valorFrete;
  }


  // =========================================================
  // SELECIONAR PAGAMENTO
  // =========================================================

  selecionarPagamento(
    metodo: 'pix' | 'cartao'
  ): void {

    this.erro = '';

    this.metodoPagamento =
      metodo;


    if (metodo === 'pix') {

      console.log(
        '💠 Método selecionado: PIX'
      );


      this.desmontarCardForm();

      return;
    }


    console.log(
      '💳 Método selecionado: CARTÃO'
    );


    this.cardToken =
      null;

    this.cardPaymentMethodId =
      null;

    this.cardIssuerId =
      null;

    this.cardInstallments =
      1;


    /*
     * O Angular precisa primeiro
     * renderizar o formulário no DOM.
     */

    setTimeout(
      () => {

        this.inicializarCardForm();

      },
      50
    );
  }


  // =========================================================
  // DESMONTAR CARD FORM
  // =========================================================

  private desmontarCardForm(): void {

    try {

      if (
        this.cardForm?.unmount
      ) {

        this.cardForm.unmount();
      }

    } catch (error) {

      console.warn(
        '⚠️ Erro ao desmontar CardForm:',
        error
      );
    }


    this.cardForm =
      null;

    this.cardFormInicializado =
      false;

    this.cardToken =
      null;

    this.cardPaymentMethodId =
      null;

    this.cardIssuerId =
      null;

    this.cardInstallments =
      1;

    this.processandoPagamentoCartao =
      false;
  }


  // =========================================================
  // DESTRUIÇÃO
  // =========================================================

  ngOnDestroy(): void {

    this.desmontarCardForm();
  }


  // =========================================================
  // BOTÃO CONTINUAR PAGAMENTO
  // =========================================================

  continuarPagamento(): void {

    if (this.carregando) {
      return;
    }


    if (!this.endereco) {

      this.erro =
        'Selecione ou cadastre um endereço de entrega.';

      return;
    }


    if (!this.itens.length) {

      this.erro =
        'Seu carrinho está vazio.';

      return;
    }


    // =======================================================
    // CARTÃO
    // =======================================================

    if (
      this.metodoPagamento ===
      'cartao'
    ) {

      this.submeterCardForm();

      return;
    }


    // =======================================================
    // PIX
    // =======================================================

    this.criarPedidoPix();
  }


  // =========================================================
  // SUBMIT REAL DO CARD FORM
  // =========================================================

  private submeterCardForm(): void {

    if (this.processandoPagamentoCartao) {

      console.warn(
        '⚠️ Já existe um pagamento sendo processado.'
      );

      return;
    }


    if (!this.cardForm) {

      this.erro =
        'O formulário do cartão ainda não foi carregado.';

      return;
    }


    if (!this.cardFormInicializado) {

      this.erro =
        'Aguarde o formulário do cartão terminar de carregar.';

      return;
    }


    const form =
      document.getElementById(
        'form-checkout'
      ) as HTMLFormElement | null;


    if (!form) {

      this.erro =
        'O formulário do cartão não foi encontrado.';

      return;
    }


    this.erro = '';


    console.log(
      '🚀 Disparando submit real do CardForm...'
    );


    if (
      typeof form.requestSubmit ===
      'function'
    ) {

      form.requestSubmit();

      return;
    }


    const submitButton =
      document.getElementById(
        'form-checkout__submit'
      ) as HTMLButtonElement | null;


    if (submitButton) {

      submitButton.click();

      return;
    }


    this.erro =
      'Não foi possível enviar o formulário do cartão.';
  }


  // =========================================================
  // FLUXO PIX
  // =========================================================

  private criarPedidoPix(): void {

    const token =
      localStorage.getItem('token');


    if (!token) {

      this.erro =
        'Sua sessão expirou. Faça login novamente.';

      return;
    }


    const headers =
      new HttpHeaders()
        .set(
          'Authorization',
          `Bearer ${token}`
        );


    this.carregando =
      true;

    this.erro = '';


    this.http.post<any>(
      'http://localhost:3000/pedidos',
      {},
      {
        headers
      }

    ).subscribe({

      next: (resposta) => {

        console.log(
          'Pedido criado:',
          resposta
        );


        this.carregando =
          false;


        this.numeroPedidoCriado =
          resposta?.pedido?.numeroPedido ||
          null;


        this.qrCodeBase64 =
          resposta?.pagamento?.qrCodeBase64 ||
          null;


        this.qrCode =
          resposta?.pagamento?.qrCode ||
          null;


        this.ticketUrl =
          resposta?.pagamento?.ticketUrl ||
          null;


        this.pedidoCriado =
          true;
      },


      error: (erro) => {

        console.error(
          'Erro ao criar pedido:',
          erro
        );


        this.carregando =
          false;


        this.erro =
          erro?.error?.mensagem ||
          'Não foi possível criar o pedido.';
      }

    });
  }


  // =========================================================
  // COPIAR PIX
  // =========================================================

  copiarPix(): void {

    if (!this.qrCode) {
      return;
    }


    navigator.clipboard
      .writeText(
        this.qrCode
      )

      .then(() => {

        alert(
          'Código Pix copiado!'
        );

      })

      .catch(() => {

        this.erro =
          'Não foi possível copiar o código Pix.';
      });
  }


  // =========================================================
  // FORMATAR MOEDA
  // =========================================================

  formatarMoeda(
    valor: number
  ): string {

    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL' 
      }
    );
    
  }


  // =========================================================
  // VOLTAR PARA A LOJA
  // =========================================================

  voltarCarrinho(): void {

    this.router.navigate([
      '/'
    ]);
  }

  irParaMeusPedidos(): void {
    this.router.navigate(['/meus-pedidos']);
  }

}