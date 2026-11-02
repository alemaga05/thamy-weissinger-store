import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';




interface Endereco {
  id?: number;
  cep: string;
  rua: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  principal: boolean;
}


interface Pedido {
  id: number;
  numeroPedido: string;
  status: string;
  total: number;
  data: string;
  statusPagamento?: string;
  itens: PedidoItem[];
}

interface PedidoItem {
  id?: number;
  produtoId: number;
  nomeProduto: string;
  imagemUrl: string | null;
  precoUnitario: number;
  quantidade: number;
  tamanho: string | null;
  subtotal: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  // =========================================================
  // ABA ATIVA
  // =========================================================

  abaAtiva: 'pedidos' | 'dados' | 'enderecos' = 'dados';


  // =========================================================
  // LOGIN
  // =========================================================

  isLoggedIn = false;


  // =========================================================
  // EDIÇÃO
  // =========================================================

  editandoDados = false;
  editandoEndereco = false;


  // =========================================================
  // ESTADOS DE CARREGAMENTO
  // =========================================================

  salvando = false;
  carregandoPedidos = false;
  carregandoEnderecos = false;
  carregandoCep = false;


  // =========================================================
  // ERROS
  // =========================================================

  erroPedidos = '';
  erroEnderecos = '';
  erroCep = '';


  // =========================================================
  // USUÁRIO
  // =========================================================

  usuario = {
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: ''
  };


  // =========================================================
  // ENDEREÇOS
  // =========================================================

  enderecos: Endereco[] = [];


  enderecoAtual: Endereco = this.criarEnderecoVazio();


  // =========================================================
  // PEDIDOS
  // =========================================================

  pedidos: Pedido[] = [];


  // =========================================================
  // CONSTRUTOR
  // =========================================================

 constructor(
  private http: HttpClient,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.carregarPerfil();
  }


  // =========================================================
  // CRIA ENDEREÇO VAZIO
  // =========================================================

  criarEnderecoVazio(): Endereco {

    return {
      cep: '',
      rua: '',
      numero: '',
      complemento: null,
      bairro: '',
      cidade: '',
      estado: '',
      pais: 'Brasil',
      principal: false
    };

  }


  // =========================================================
  // TOKEN / HEADERS
  // =========================================================

  private obterHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

  }


  // =========================================================
  // CARREGAR PERFIL
  // =========================================================

  carregarPerfil(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.isLoggedIn = false;
    this.cdr.detectChanges();
    return;
  }

  this.http.get<any>(
    'http://localhost:3000/perfil',
    { headers: this.obterHeaders() }
  ).subscribe({
    next: (dadosDoBanco) => {
      this.usuario = {
        nome: dadosDoBanco?.name ?? dadosDoBanco?.nome ?? '',
        email: dadosDoBanco?.email ?? '',
        telefone: dadosDoBanco?.telefone ?? 'Não cadastrado',
        dataNascimento:
          dadosDoBanco?.dataNascimento ?? 'Não cadastrada'
      };

      this.isLoggedIn = true;

      // Atualiza a interface assim que os dados chegam.
      this.cdr.detectChanges();

      // Mantemos o carregamento de endereços como já estava.
      this.carregarEnderecos();
    },

    error: (erro) => {
      console.error('Erro ao carregar perfil:', erro);

      this.isLoggedIn = false;
      this.cdr.detectChanges();
    }
  });
}


  // =========================================================
  // MUDAR ABA
  // =========================================================

  mudarAba(aba: 'pedidos' | 'dados' | 'enderecos'): void {
    this.abaAtiva = aba;

    this.editandoDados = false;
    this.editandoEndereco = false;

    if (aba === 'pedidos') {
      this.carregandoPedidos = true;
      this.erroPedidos = '';

      this.cdr.detectChanges();

      this.carregarPedidos();
    }

    if (aba === 'enderecos') {
      this.carregarEnderecos();
    }

    this.cdr.detectChanges();
  }

  // =========================================================
  // CARREGAR ENDEREÇOS
  // =========================================================

carregarEnderecos(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.carregandoEnderecos = false;
    this.enderecos = [];
    this.erroEnderecos = 'Faça login para visualizar seus endereços.';
    this.cdr.detectChanges();
    return;
  }

  this.carregandoEnderecos = true;
  this.erroEnderecos = '';

  const headers = this.obterHeaders();

  this.http.get<Endereco[]>(
    'http://localhost:3000/enderecos',
    { headers }
  ).subscribe({
    next: (enderecos) => {
      this.enderecos = (enderecos || []).map((endereco) => ({
        id: endereco.id,
        cep: endereco.cep || '',
        rua: endereco.rua || '',
        numero: endereco.numero || '',
        complemento: endereco.complemento || null,
        bairro: endereco.bairro || '',
        cidade: endereco.cidade || '',
        estado: endereco.estado || '',
        pais: endereco.pais || 'Brasil',
        principal: endereco.principal === true
      }));

      // Se existir apenas um endereço, ele será tratado como principal.
      if (this.enderecos.length === 1) {
        this.enderecos[0].principal = true;
      }

      this.carregandoEnderecos = false;
      this.cdr.detectChanges();
    },

    error: (erro) => {
      console.error('Erro ao carregar endereços:', erro);

      this.erroEnderecos =
        'Não foi possível carregar seus endereços.';

      this.carregandoEnderecos = false;
      this.cdr.detectChanges();
    }
  });
}



  // =========================================================
  // NOVO ENDEREÇO
  // =========================================================

  novoEndereco(): void {

    this.enderecoAtual =
      this.criarEnderecoVazio();


    /*
     * Se ainda não existe nenhum endereço,
     * o novo já começa como principal.
     */

    if (this.enderecos.length === 0) {

      this.enderecoAtual.principal = true;

    }


    this.erroCep = '';

    this.editandoEndereco = true;

  }


  // =========================================================
  // EDITAR ENDEREÇO
  // =========================================================

editarEndereco(endereco: Endereco): void {
  this.enderecoAtual = {
    ...endereco,
    complemento: endereco.complemento || null
  };

  this.erroCep = '';
  this.editandoEndereco = true;

  // Atualiza a interface após abrir o formulário.
  this.cdr.detectChanges();
}


  // =========================================================
  // FORMATAR CEP
  // =========================================================

  formatarCep(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    let cep =
      input.value.replace(/\D/g, '');


    cep =
      cep.substring(0, 8);


    if (cep.length > 5) {

      cep =
        cep.substring(0, 5) +
        '-' +
        cep.substring(5);

    }


    this.enderecoAtual.cep = cep;


    /*
     * Se o usuário alterar o CEP,
     * limpamos o erro anterior.
     */

    this.erroCep = '';

  }


  // =========================================================
  // BUSCAR CEP
  // =========================================================

  
buscarCep(): void {
  const cep = (this.enderecoAtual.cep || '').replace(/\D/g, '');

  if (cep.length === 0) {
    this.erroCep = '';
    this.cdr.detectChanges();
    return;
  }

  if (cep.length !== 8) {
    this.erroCep = 'Digite um CEP válido com 8 números.';
    this.cdr.detectChanges();
    return;
  }

  this.carregandoCep = true;
  this.erroCep = '';

  // Formata o CEP.
  this.enderecoAtual.cep =
    `${cep.substring(0, 5)}-${cep.substring(5)}`;

  // Atualiza a tela enquanto consulta o ViaCEP.
  this.cdr.detectChanges();

  this.http.get<any>(
    `https://viacep.com.br/ws/${cep}/json/`
  ).subscribe({
    next: (dados) => {
      if (dados.erro) {
        this.erroCep = 'CEP não encontrado.';
        this.carregandoCep = false;
        this.cdr.detectChanges();
        return;
      }

      // Preenche os campos com os dados do ViaCEP.
      this.enderecoAtual.rua = dados.logradouro || '';
      this.enderecoAtual.bairro = dados.bairro || '';
      this.enderecoAtual.cidade = dados.localidade || '';
      this.enderecoAtual.estado = dados.uf || '';
      this.enderecoAtual.pais = 'Brasil';

      this.carregandoCep = false;

      // Atualiza a interface imediatamente.
      this.cdr.detectChanges();
    },

    error: (erro) => {
      console.error('Erro ao consultar CEP:', erro);

      this.erroCep =
        'Não foi possível consultar o CEP. Tente novamente.';

      this.carregandoCep = false;
      this.cdr.detectChanges();
    }
  });
}


  // =========================================================
  // TORNAR ENDEREÇO PRINCIPAL
  // =========================================================

  tornarPrincipal(endereco: Endereco): void {

    if (!endereco.id) {
      return;
    }


    /*
     * Se já for principal, não precisa
     * fazer nenhuma requisição.
     */

    if (endereco.principal) {
      return;
    }


    const headers = this.obterHeaders();


    this.http.put<any>(
      `http://localhost:3000/enderecos/${endereco.id}`,
      {
        principal: true
      },
      { headers }
    ).subscribe({

      next: () => {

        /*
         * Atualiza imediatamente a interface.
         */

        this.enderecos =
          this.enderecos.map((item) => ({

            ...item,

            principal:
              item.id === endereco.id

          }));


        alert(
          'Endereço principal atualizado com sucesso!'
        );

      },

      error: (erro) => {

        console.error(
          'Erro ao tornar endereço principal:',
          erro
        );

        alert(
          erro?.error?.mensagem ||
          'Não foi possível alterar o endereço principal.'
        );

      }

    });

  }


  // =========================================================
  // SALVAR ENDEREÇO
  // =========================================================

  salvarEndereco(): void {

    if (this.salvando) {
      return;
    }


    // -------------------------------------------------------
    // VALIDAÇÕES
    // -------------------------------------------------------

    const cep =
      (this.enderecoAtual.cep || '')
        .replace(/\D/g, '');


    if (cep.length !== 8) {

      this.erroCep =
        'Digite um CEP válido com 8 números.';

      return;

    }


    if (!this.enderecoAtual.rua?.trim()) {

      alert('Informe a rua.');

      return;

    }


    if (!this.enderecoAtual.numero?.trim()) {

      alert('Informe o número do endereço.');

      return;

    }


    if (!this.enderecoAtual.bairro?.trim()) {

      alert('Informe o bairro.');

      return;

    }


    if (!this.enderecoAtual.cidade?.trim()) {

      alert('Informe a cidade.');

      return;

    }


    if (!this.enderecoAtual.estado?.trim()) {

      alert('Informe o estado.');

      return;

    }


    /*
     * Mantém o CEP formatado.
     */

    this.enderecoAtual.cep =
      `${cep.substring(0, 5)}-${cep.substring(5)}`;


    /*
     * Complemento vazio vira null.
     */

    this.enderecoAtual.complemento =
      this.enderecoAtual.complemento?.trim()
        ? this.enderecoAtual.complemento.trim()
        : null;


    /*
     * Primeiro endereço obrigatoriamente principal.
     */

    if (this.enderecos.length === 0) {

      this.enderecoAtual.principal = true;

    }


    this.salvando = true;


    const headers = this.obterHeaders();


    // =======================================================
    // ATUALIZAR
    // =======================================================

    if (this.enderecoAtual.id) {

      this.http.put<Endereco>(
        `http://localhost:3000/enderecos/${this.enderecoAtual.id}`,
        this.enderecoAtual,
        { headers }
      ).subscribe({

        next: (endAtualizado) => {

          /*
           * Atualiza a lista local.
           */

          const index =
            this.enderecos.findIndex(
              e => e.id === endAtualizado.id
            );


          if (index > -1) {

            this.enderecos[index] =
              endAtualizado;

          }


          /*
           * Se este endereço virou principal,
           * garante visualmente que os outros
           * deixem de ser principais.
           */

          if (endAtualizado.principal) {

            this.enderecos =
              this.enderecos.map((endereco) => ({

                ...endereco,

                principal:
                  endereco.id === endAtualizado.id

              }));

          }


          this.editandoEndereco = false;

          this.salvando = false;

          // Limpa o formulário após salvar.
          this.enderecoAtual = {
            id: undefined,
            cep: '',
            rua: '',
            numero: '',
            complemento: null,
            bairro: '',
            cidade: '',
            estado: '',
            pais: 'Brasil',
            principal: false
          } as Endereco;

          // Solicita atualização imediata da interface.
          this.cdr.detectChanges();

          setTimeout(() => {

            alert(
              'Endereço atualizado com sucesso!'
            );

          }, 10);

        },

        error: (erro) => {

          console.error(
            'Erro ao atualizar endereço:',
            erro
          );

          this.salvando = false;


          alert(
            erro?.error?.mensagem ||
            'Erro ao atualizar o endereço.'
          );

        }

      });


      return;

    }


    // =======================================================
    // NOVO ENDEREÇO
    // =======================================================

    this.http.post<Endereco>(
      'http://localhost:3000/enderecos',
      this.enderecoAtual,
      { headers }
    ).subscribe({

      next: (novoEndereco) => {

        /*
         * Se o backend retornar o endereço completo,
         * usamos exatamente o que veio do banco.
         */

        this.enderecos =
          [
            ...this.enderecos,
            novoEndereco
          ];


        /*
         * Garante que apenas o novo principal
         * apareça como principal no frontend.
         */

        if (novoEndereco.principal) {

          this.enderecos =
            this.enderecos.map((endereco) => ({

              ...endereco,

              principal:
                endereco.id === novoEndereco.id

            }));

        }


        this.editandoEndereco = false;

        this.salvando = false;

        // Limpa o formulário após salvar.
        this.enderecoAtual = {
          id: undefined,
          cep: '',
          rua: '',
          numero: '',
          complemento: null,
          bairro: '',
          cidade: '',
          estado: '',
          pais: 'Brasil',
          principal: false
        } as Endereco;

        // Solicita atualização imediata da interface.
        this.cdr.detectChanges();

        this.carregarEnderecos();

        setTimeout(() => {

          alert(
            'Endereço salvo com sucesso!'
          );

        }, 10);

      },

      error: (erro) => {

        console.error(
          'Erro ao salvar endereço:',
          erro
        );

        this.salvando = false;


        alert(
          erro?.error?.mensagem ||
          'Erro ao salvar o endereço.'
        );

      }

    });

  }


  // =========================================================
  // EXCLUIR ENDEREÇO
  // =========================================================

excluirEndereco(id: number): void {
  const confirmacao = confirm(
    'Tem certeza que deseja excluir este endereço?'
  );

  if (!confirmacao) {
    return;
  }

  const headers = this.obterHeaders();

  this.http.delete(
    `http://localhost:3000/enderecos/${id}`,
    { headers }
  ).subscribe({
    next: () => {
      // Remove o endereço imediatamente da lista.
      this.enderecos = this.enderecos.filter(
        endereco => endereco.id !== id
      );

      // Se restou apenas um endereço, ele será principal.
      if (this.enderecos.length === 1) {
        this.enderecos[0].principal = true;
      }

      // Atualiza a interface imediatamente.
      this.cdr.detectChanges();

      // Sincroniza com o backend para confirmar
      // qual endereço ficou como principal.
      this.carregarEnderecos();

      alert('Endereço excluído com sucesso!');
    },

    error: (erro) => {
      console.error('Erro ao excluir endereço:', erro);

      this.cdr.detectChanges();

      alert(
        erro?.error?.mensagem ||
        'Erro ao excluir endereço.'
      );
    }
  });
}


  // =========================================================
  // CANCELAR EDIÇÃO DO ENDEREÇO
  // =========================================================

  cancelarEdicaoEndereco(): void {

    this.editandoEndereco = false;

    this.erroCep = '';

    this.enderecoAtual =
      this.criarEnderecoVazio();

  }


// =========================================================
// CARREGAR PEDIDOS
// =========================================================

private requisicaoPedidosEmAndamento = false;

carregarPedidos(): void {
  const token = localStorage.getItem('token');

  if (!token) {
    this.pedidos = [];
    this.carregandoPedidos = false;
    this.erroPedidos = 'Faça login para visualizar seus pedidos.';
    this.cdr.detectChanges();
    return;
  }

  this.carregandoPedidos = true;
  this.erroPedidos = '';

  this.http.get<any[]>(
    'http://localhost:3000/pedidos',
    { headers: this.obterHeaders() }
  ).subscribe({
    next: (resposta) => {
      this.ngZone.run(() => {
        const pedidos = Array.isArray(resposta) ? resposta : [];

        this.pedidos = pedidos.map((pedido) => ({
          id: Number(pedido.id),
          numeroPedido: pedido.numeroPedido || String(pedido.id),
          status: pedido.statusPedido || pedido.status || 'PENDENTE',
          statusPagamento: pedido.statusPagamento || 'PENDENTE',
          total: Number(pedido.valorTotal ?? pedido.total ?? 0),
          data: pedido.criadoEm || pedido.data || '',
          itens: Array.isArray(pedido.itens)
            ? pedido.itens.map((item: any) => ({
                id: item.id,
                produtoId: Number(item.produtoId),
                nomeProduto: item.nomeProduto || 'Produto',
                imagemUrl: item.imagemUrl || null,
                precoUnitario: Number(item.precoUnitario ?? 0),
                quantidade: Number(item.quantidade ?? 0),
                tamanho: item.tamanho || null,
                subtotal: Number(item.subtotal ?? 0)
              }))
            : []
        }));

        this.carregandoPedidos = false;
        this.erroPedidos = '';

        this.cdr.detectChanges();
      });
    },

    error: (err) => {
      this.ngZone.run(() => {
        console.error('Erro ao carregar pedidos do cliente:', err);

        this.pedidos = [];
        this.carregandoPedidos = false;
        this.erroPedidos =
          err.error?.mensagem ||
          'Não foi possível carregar seus pedidos.';

        this.cdr.detectChanges();
      });
    }
  });
}

  // =========================================================
  // EDITAR DADOS
  // =========================================================

  iniciarEdicaoDados(): void {

    this.editandoDados = true;

  }


  // =========================================================
  // CANCELAR EDIÇÃO DOS DADOS
  // =========================================================

  cancelarEdicaoDados(): void {

    this.editandoDados = false;

    /*
     * Recarrega os dados originais do banco.
     */

    this.carregarPerfil();

  }


  // =========================================================
  // SALVAR DADOS DO USUÁRIO
  // =========================================================

  salvarDados(): void {

    if (this.salvando) {
      return;
    }


    this.salvando = true;


    const headers =
      this.obterHeaders();


    this.http.put<any>(
      'http://localhost:3000/perfil',
      this.usuario,
      { headers }
    ).subscribe({

      next: (dadosAtualizados) => {

        if (dadosAtualizados) {

          this.usuario.nome =
            dadosAtualizados.name ??
            dadosAtualizados.nome ??
            this.usuario.nome;


          this.usuario.email =
            dadosAtualizados.email ??
            this.usuario.email;


          this.usuario.telefone =
            dadosAtualizados.telefone ??
            this.usuario.telefone;


          this.usuario.dataNascimento =
            dadosAtualizados.dataNascimento ??
            this.usuario.dataNascimento;

        }


        this.editandoDados = false;

        this.salvando = false;


        alert(
          'Dados atualizados com sucesso!'
        );

      },

      error: (erro) => {

        console.error(
          'Erro ao atualizar dados:',
          erro
        );


        this.salvando = false;


        alert(
          erro?.error?.mensagem ||
          'Erro ao atualizar seus dados.'
        );

      }

    });

  }


  // =========================================================
  // FORMATAR CEP PARA EXIBIÇÃO
  // =========================================================

  formatarCepExibicao(cep: string): string {

    if (!cep) {
      return '';
    }


    const numeros =
      cep.replace(/\D/g, '');


    if (numeros.length !== 8) {
      return cep;
    }


    return (
      numeros.substring(0, 5) +
      '-' +
      numeros.substring(5)
    );

  }

  toggleEditarDados(): void {

  this.editandoDados = !this.editandoDados;

}

sairDaConta(): void {

  const confirmacao = confirm(
    'Tem certeza que deseja sair da sua conta?'
  );

  if (!confirmacao) {
    return;
  }

  localStorage.removeItem('token');

  this.isLoggedIn = false;

  window.location.href = '/login';

}

}