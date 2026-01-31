import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'aluno' | 'professor'>('aluno');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      <div className="app-header">
        <img src="/src/assets/school.svg" alt="APTO" className="app-logo" />
        <h1 className="app-title">APTO</h1>
      </div>

      <div className="app-content">
        {token && usuario ? (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Bem-vindo!</h2>
            <p className="welcome-text">{usuario.nome}</p>
            <p className="user-type">{usuario.tipo === 'aluno' ? 'Aluno' : 'Professor'}</p>
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

export default App;
