import { useState, useRef, useEffect } from 'react';
import './App.css';

type Page = 'login' | 'dashboard-aluno' | 'dashboard-professor' | 'avaliacoes-reforco' | 'todas-avaliacoes';

function App() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'aluno' | 'professor'>('aluno');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !senha) {
      setError('Preencha todos os campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const endpoint = tipo === 'aluno' ? '/api/alunos/login' : '/api/professores/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.erro || 'Erro ao autenticar');
      } else {
        setToken(data.token);
        setUsuario(data.usuario);
        setError('');
        setCurrentPage(data.usuario.tipo === 'aluno' ? 'dashboard-aluno' : 'dashboard-professor');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUsuario(null);
    setNome('');
    setSenha('');
    setError('');
    setCurrentPage('login');
    setAvaliacoes([]);
  };

  const fetchAvaliacoes = async (tipo: 'reforco' | 'todas') => {
    setLoadingAvaliacoes(true);
    try {
      const endpoint = tipo === 'reforco' 
        ? `/api/alunos/${usuario.id}/resumo-avaliacoes`
        : `/api/avaliacoes-alunos/aluno/${usuario.id}`;
      
      console.log('Fetching:', endpoint);
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro da API:', errorData);
        
        // Se for 404 (nenhuma avaliação), mostrar lista vazia
        if (response.status === 404) {
          setAvaliacoes([]);
          setCurrentPage(tipo === 'reforco' ? 'avaliacoes-reforco' : 'todas-avaliacoes');
          return;
        }
        
        setError(errorData.erro || 'Erro ao buscar avaliações');
        return;
      }
      
      const data = await response.json();
      console.log('Data received:', data);
      
      // Extrair o array correto da resposta
      let avaliacoesArray = [];
      if (tipo === 'reforco') {
        // Para reforço, a API retorna {idAluno, avaliacoesComReforco}
        avaliacoesArray = data.avaliacoesComReforco || [];
      } else {
        // Para todas, a API pode retornar um array direto
        avaliacoesArray = Array.isArray(data) ? data : data.avaliacoes || [];
      }
      
      setAvaliacoes(avaliacoesArray);
      setCurrentPage(tipo === 'reforco' ? 'avaliacoes-reforco' : 'todas-avaliacoes');
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
      setError('Erro ao buscar avaliações');
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-wrapper">
      {!token ? (
        /* Login Page */
        <>
          <div className="app-header">
            <img src="/src/assets/school.svg" alt="APTO" className="app-logo" />
            <h1 className="app-title">APTO</h1>
          </div>

          <div className="app-content">
            <form onSubmit={handleSubmit} className="login-form-container">
              <h2 className="form-title">Faça seu Login</h2>

              <div className="form-group" ref={dropdownRef}>
                <label htmlFor="tipo">Tipo de Usuário</label>
                <div className="custom-select">
                  <button
                    type="button"
                    className="custom-select-button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    id="tipo"
                  >
                    <span>{tipo === 'aluno' ? 'Aluno' : 'Professor'}</span>
                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {dropdownOpen && (
                    <div className="custom-select-options">
                      <button
                        type="button"
                        className={`custom-select-option ${tipo === 'aluno' ? 'active' : ''}`}
                        onClick={() => {
                          setTipo('aluno');
                          setDropdownOpen(false);
                        }}
                      >
                        Aluno
                      </button>
                      <button
                        type="button"
                        className={`custom-select-option ${tipo === 'professor' ? 'active' : ''}`}
                        onClick={() => {
                          setTipo('professor');
                          setDropdownOpen(false);
                        }}
                      >
                        Professor
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Digite seu nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  className="form-input"
                  disabled={loading}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Conectando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </>
      ) : (
        /* Dashboard Pages */
        <>
          <header className="dashboard-header-top">
            <div className="header-left">
              <img src="/src/assets/school.svg" alt="APTO" className="header-logo" />
              <span className="header-title">
                {currentPage === 'dashboard-aluno' && 'DASHBOARD'}
                {currentPage === 'avaliacoes-reforco' && 'AVALIAÇÕES PARA REFORÇO'}
                {currentPage === 'todas-avaliacoes' && 'TODAS AS AVALIAÇÕES'}
              </span>
            </div>
            <button onClick={handleLogout} className="header-logout">Sair</button>
          </header>

          <div className="app-content">
            {currentPage === 'dashboard-aluno' ? (
              /* Aluno Dashboard */
              <div className="dashboard-container">
                <div className="features-grid">
                  <button onClick={() => fetchAvaliacoes('todas')} className="feature-card">
                    <div className="feature-icon">📋</div>
                    <h3>Todas as Avaliações</h3>
                    <p>Acesse todas as suas notas</p>
                  </button>

                  <button onClick={() => fetchAvaliacoes('reforco')} className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>Avaliações para Reforço</h3>
                    <p>Veja suas avaliações abaixo da média</p>
                  </button>
                </div>
              </div>
            ) : currentPage === 'avaliacoes-reforco' ? (
              /* Avaliações para Reforço Page */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <h1 className="page-title">Avaliações para Reforço</h1>
                </div>

                {loadingAvaliacoes ? (
                  <div className="loading-state">
                    <p>Carregando suas avaliações...</p>
                  </div>
                ) : avaliacoes.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">📭</div>
                    <p>Nenhuma avaliação encontrada</p>
                  </div>
                ) : (
                  <div className="avaliacoes-list">
                    {avaliacoes
                      .slice()
                      .sort((a: any, b: any) => {
                        const dataA = new Date(a.dataAvaliacao).getTime();
                        const dataB = new Date(b.dataAvaliacao).getTime();
                        return dataA - dataB;
                      })
                      .map((avaliacao: any, idx: number) => (
                      <div key={idx} className="avaliacao-item reforco-highlight">
                        <div className="avaliacao-header">
                          <h3>{avaliacao.nomeAvaliacao || 'Avaliação'}</h3>
                          <span className="nota">{avaliacao.nota || 0}/10</span>
                        </div>
                        <p className="curso">Curso: {avaliacao.nomeCurso || 'Curso não informado'}</p>
                        <p className="data">Data: {avaliacao.dataAvaliacao ? new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR') : 'Data não disponível'}</p>
                        {avaliacao.observacoes && (
                          <p className="observacoes">{avaliacao.observacoes}</p>
                        )}
                        {avaliacao.nomeReforco && (
                          <div className="reforco-badge">
                            📚 Curso de Reforço: {avaliacao.nomeReforco}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <footer className="page-footer">
                  <button onClick={() => setCurrentPage('dashboard-aluno')} className="back-button-footer">
                    ← Voltar
                  </button>
                </footer>
              </div>
            ) : currentPage === 'todas-avaliacoes' ? (
              /* Todas as Avaliações Page */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <h1 className="page-title">Todas as Avaliações</h1>
                </div>

                {loadingAvaliacoes ? (
                  <div className="loading-state">
                    <p>Carregando suas avaliações...</p>
                  </div>
                ) : avaliacoes.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">📭</div>
                    <p>Nenhuma avaliação encontrada</p>
                  </div>
                ) : (
                  <div className="avaliacoes-list">
                    {avaliacoes
                      .slice()
                      .sort((a: any, b: any) => {
                        const dataA = new Date(a.idAvaliacao?.dataAvaliacao).getTime();
                        const dataB = new Date(b.idAvaliacao?.dataAvaliacao).getTime();
                        return dataB - dataA;
                      })
                      .map((avaliacao: any, idx: number) => (
                      <div key={idx} className="avaliacao-item">
                        <div className="avaliacao-header">
                          <div>
                            <h3>{avaliacao.idAvaliacao?.nome || 'Avaliação'}</h3>
                            {avaliacao.idAvaliacao?.dataAvaliacao && (
                              <p className="data">{new Date(avaliacao.idAvaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                          <span className="nota">{avaliacao.nota || 0}/10</span>
                        </div>
                        {avaliacao.idAvaliacao?.idCurso && (
                          <p className="curso">Curso: {avaliacao.idAvaliacao.idCurso.nome}</p>
                        )}
                        {avaliacao.observacoes && (
                          <p className="observacoes">{avaliacao.observacoes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <footer className="page-footer">
                  <button onClick={() => setCurrentPage('dashboard-aluno')} className="back-button-footer">
                    ← Voltar
                  </button>
                </footer>
              </div>
            ) : (
              /* Professor Dashboard - Placeholder */
              <div className="dashboard-container">
                <p style={{ textAlign: 'center', color: '#999' }}>Dashboard do professor em desenvolvimento...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
