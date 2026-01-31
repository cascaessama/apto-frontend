import { useState, useRef, useEffect } from 'react';
import './App.css';

type Page = 'login' | 'cadastro-aluno' | 'cadastro-professor' | 'dashboard-aluno' | 'dashboard-professor' | 'avaliacoes-reforco' | 'todas-avaliacoes' | 'professor-cursos' | 'professor-avaliacoes' | 'professor-alunos-avaliacoes' | 'professor-alunos' | 'professor-professores';

function App() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'aluno' | 'professor'>('aluno');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [reforcoDropdownOpen, setReforcoDropdownOpen] = useState(false);
  const [cursoDropdownOpen, setCursoDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [confirmSenha, setConfirmSenha] = useState('');
  const [success, setSuccess] = useState('');
  const [cursos, setCursos] = useState<any[]>([]);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [showFormCurso, setShowFormCurso] = useState(false);
  const [formCurso, setFormCurso] = useState({ nome: '', descricao: '', idCursoReforco: '' });
  const [editandoCurso, setEditandoCurso] = useState<any>(null);
  const [avaliacoesProfessor, setAvaliacoesProfessor] = useState<any[]>([]);
  const [loadingAvaliacoesProfessor, setLoadingAvaliacoesProfessor] = useState(false);
  const [showFormAvaliacao, setShowFormAvaliacao] = useState(false);
  const [formAvaliacao, setFormAvaliacao] = useState({ nome: '', descricao: '', idCurso: '', dataAvaliacao: '' });
  const [editandoAvaliacao, setEditandoAvaliacao] = useState<any>(null);
  const [pesquisaAvaliacao, setPesquisaAvaliacao] = useState('');
  const [pesquisaCurso, setPesquisaCurso] = useState('');
  const [pesquisaNota, setPesquisaNota] = useState('');
  const [notasAlunos, setNotasAlunos] = useState<any[]>([]);
  const [loadingNotasAlunos, setLoadingNotasAlunos] = useState(false);
  const [showFormNota, setShowFormNota] = useState(false);
  const [formNota, setFormNota] = useState({ nota: '', observacoes: '', idAvaliacao: '', idAluno: '' });
  const [editandoNota, setEditandoNota] = useState<any>(null);
  const [avaliacoesList, setAvaliacoesList] = useState<any[]>([]);
  const [alunosList, setAlunosList] = useState<any[]>([]);
  const [avaliacaoDropdownOpen, setAvaliacaoDropdownOpen] = useState(false);
  const [alunoDropdownOpen, setAlunoDropdownOpen] = useState(false);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [showFormAluno, setShowFormAluno] = useState(false);
  const [formAluno, setFormAluno] = useState({ nome: '', senha: '' });
  const [editandoAluno, setEditandoAluno] = useState<any>(null);
  const [pesquisaAluno, setPesquisaAluno] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reforcoDropdownRef = useRef<HTMLDivElement>(null);
  const cursoDropdownRef = useRef<HTMLDivElement>(null);
  const avaliacaoDropdownRef = useRef<HTMLDivElement>(null);
  const alunoDropdownRef = useRef<HTMLDivElement>(null);

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
      if (avaliacaoDropdownRef.current && !avaliacaoDropdownRef.current.contains(event.target as Node)) {
        setAvaliacaoDropdownOpen(false);
      }
      if (alunoDropdownRef.current && !alunoDropdownRef.current.contains(event.target as Node)) {
        setAlunoDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCadastro = async (e: React.FormEvent, tipoCadastro: 'aluno' | 'professor') => {
    e.preventDefault();
    
    if (!nome || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    if (senha.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const endpoint = tipoCadastro === 'aluno' ? '/api/alunos' : '/api/professores';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, senha })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.erro || 'Erro ao criar cadastro');
        return;
      }

      // Após cadastro bem-sucedido, retornar ao login
      setNome('');
      setSenha('');
      setConfirmSenha('');
      setError('');
      setSuccess(`Cadastro realizado com sucesso! Faça login com suas credenciais.`);
      
      setTimeout(() => {
        setSuccess('');
        setCurrentPage('login');
      }, 2000);
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (reforcoDropdownRef.current && !reforcoDropdownRef.current.contains(event.target as Node)) {
        setReforcoDropdownOpen(false);
      }
      if (cursoDropdownRef.current && !cursoDropdownRef.current.contains(event.target as Node)) {
        setCursoDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar cursos quando a página é aberta
  useEffect(() => {
    if (currentPage === 'professor-cursos' && usuario && token) {
      fetchCursos();
    }
  }, [currentPage, usuario, token]);

  // Carregar avaliações quando a página é aberta
  useEffect(() => {
    if (currentPage === 'professor-avaliacoes' && usuario && token) {
      fetchAvaliacoesProfessor();
    }
  }, [currentPage, usuario, token]);

  // Carregar notas dos alunos quando a página é aberta
  useEffect(() => {
    if (currentPage === 'professor-alunos-avaliacoes' && usuario && token) {
      fetchNotasAlunos();
    }
  }, [currentPage, usuario, token]);

  // Carregar alunos quando a página é aberta
  useEffect(() => {
    if (currentPage === 'professor-alunos' && usuario && token) {
      fetchAlunos();
    }
  }, [currentPage, usuario, token]);

  // Carregar listas de avaliações e alunos quando o formulário é aberto
  useEffect(() => {
    if (showFormNota && usuario && token) {
      fetchAvaliacoesList();
      fetchAlunosList();
    }
  }, [showFormNota, usuario, token]);

  const fetchCursos = async () => {
    setLoadingCursos(true);
    try {
      const response = await fetch('/api/cursos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setCursos([]);
        } else {
          setError(errorData.erro || 'Erro ao buscar cursos');
        }
        return;
      }

      const data = await response.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar cursos');
    } finally {
      setLoadingCursos(false);
    }
  };

  const handleSalvarCurso = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCurso.nome || !formCurso.descricao) {
      setError('Nome e descrição são obrigatórios');
      return;
    }

    if (formCurso.descricao.length > 500) {
      setError('Descrição não pode exceder 500 caracteres');
      return;
    }

    setLoading(true);
    try {
      const method = editandoCurso ? 'PUT' : 'POST';
      const endpoint = editandoCurso ? `/api/cursos/${editandoCurso._id}` : '/api/cursos';
      
      const body = {
        nome: formCurso.nome,
        descricao: formCurso.descricao,
        idProfessor: usuario.id,
        ...(formCurso.idCursoReforco ? { idCursoReforco: formCurso.idCursoReforco } : { idCursoReforco: null })
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || 'Erro ao salvar curso');
        return;
      }

      setSuccess(editandoCurso ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
      setFormCurso({ nome: '', descricao: '', idCursoReforco: '' });
      setEditandoCurso(null);
      setShowFormCurso(false);
      setError('');
      
      setTimeout(() => {
        setSuccess('');
        fetchCursos();
      }, 1500);
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarCurso = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este curso?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cursos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao deletar curso');
        return;
      }

      setSuccess('Curso deletado com sucesso!');
      setError('');
      setTimeout(() => {
        setSuccess('');
        fetchCursos();
      }, 1500);
    } catch (err) {
      setError('Erro ao deletar curso');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlunos = async () => {
    setLoadingAlunos(true);
    try {
      const response = await fetch('/api/alunos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setAlunos([]);
        } else {
          setError(errorData.erro || 'Erro ao buscar alunos');
        }
        return;
      }

      const data = await response.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar alunos');
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleSalvarAluno = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAluno.nome || !formAluno.senha) {
      setError('Nome e senha são obrigatórios');
      return;
    }

    if (formAluno.senha.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres');
      return;
    }

    setLoading(true);
    try {
      const method = editandoAluno ? 'PUT' : 'POST';
      const endpoint = editandoAluno ? `/api/alunos/${editandoAluno._id}` : '/api/alunos';
      
      const body = {
        nome: formAluno.nome,
        ...(editandoAluno ? { senha: formAluno.senha } : { senha: formAluno.senha })
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || 'Erro ao salvar aluno');
        return;
      }

      setSuccess(editandoAluno ? 'Aluno atualizado com sucesso!' : 'Aluno criado com sucesso!');
      setFormAluno({ nome: '', senha: '' });
      setEditandoAluno(null);
      setShowFormAluno(false);
      setError('');
      
      setTimeout(() => {
        setSuccess('');
        fetchAlunos();
      }, 1500);
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarAluno = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este aluno?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao deletar aluno');
        return;
      }

      setSuccess('Aluno deletado com sucesso!');
      setError('');
      setTimeout(() => {
        setSuccess('');
        fetchAlunos();
      }, 1500);
    } catch (err) {
      setError('Erro ao deletar aluno');
    } finally {
      setLoading(false);
    }
  };

  const pesquisarAluno = async (termo: string) => {
    setPesquisaAluno(termo);
    if (!termo.trim()) {
      fetchAlunos();
      return;
    }

    setLoadingAlunos(true);
    try {
      const response = await fetch(`/api/alunos/nome/${encodeURIComponent(termo)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAlunos([]);
          return;
        }
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao pesquisar alunos');
        return;
      }

      const data = await response.json();
      setAlunos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao pesquisar alunos');
    } finally {
      setLoadingAlunos(false);
    }
  };

  const fetchAvaliacoesProfessor = async () => {
    setLoadingAvaliacoesProfessor(true);
    try {
      const response = await fetch('/api/avaliacoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404) {
          setAvaliacoesProfessor([]);
        } else {
          setError(errorData.erro || 'Erro ao buscar avaliações');
        }
        return;
      }

      const data = await response.json();
      setAvaliacoesProfessor(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar avaliações');
    } finally {
      setLoadingAvaliacoesProfessor(false);
    }
  };

  const pesquisarAvaliacao = async (termo: string) => {
    setPesquisaAvaliacao(termo);
    if (!termo.trim()) {
      fetchAvaliacoesProfessor();
      return;
    }

    setLoadingAvaliacoesProfessor(true);
    try {
      const response = await fetch(`/api/avaliacoes/nome/${encodeURIComponent(termo)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAvaliacoesProfessor([]);
          return;
        }
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao pesquisar avaliações');
        return;
      }

      const data = await response.json();
      setAvaliacoesProfessor(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao pesquisar avaliações');
    } finally {
      setLoadingAvaliacoesProfessor(false);
    }
  };

  const pesquisarCurso = async (termo: string) => {
    setPesquisaCurso(termo);
    if (!termo.trim()) {
      fetchCursos();
      return;
    }

    setLoadingCursos(true);
    try {
      const response = await fetch(`/api/cursos/nome/${encodeURIComponent(termo)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setCursos([]);
          return;
        }
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao pesquisar cursos');
        return;
      }

      const data = await response.json();
      setCursos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao pesquisar cursos');
    } finally {
      setLoadingCursos(false);
    }
  };

  const fetchNotasAlunos = async () => {
    setLoadingNotasAlunos(true);
    try {
      const response = await fetch('/api/avaliacoes-alunos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao buscar notas');
        return;
      }

      const data = await response.json();
      setNotasAlunos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar notas');
    } finally {
      setLoadingNotasAlunos(false);
    }
  };

  const fetchAvaliacoesList = async () => {
    try {
      const response = await fetch('/api/avaliacoes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAvaliacoesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar avaliações');
    }
  };

  const fetchAlunosList = async () => {
    try {
      const response = await fetch('/api/alunos', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAlunosList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar alunos');
    }
  };

  const handleSalvarNota = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNota.nota || !formNota.idAvaliacao || !formNota.idAluno) {
      setError('Nota, avaliação e aluno são obrigatórios');
      return;
    }

    const notaNum = parseFloat(formNota.nota);
    if (notaNum < 0 || notaNum > 10) {
      setError('Nota deve estar entre 0 e 10');
      return;
    }

    setLoading(true);
    try {
      const method = editandoNota ? 'PUT' : 'POST';
      const endpoint = editandoNota ? `/api/avaliacoes-alunos/${editandoNota._id}` : '/api/avaliacoes-alunos';
      
      const body = {
        nota: notaNum,
        observacoes: formNota.observacoes,
        idAvaliacao: formNota.idAvaliacao,
        idAluno: formNota.idAluno
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || 'Erro ao salvar nota');
        return;
      }

      setSuccess(editandoNota ? 'Nota atualizada com sucesso!' : 'Nota criada com sucesso!');
      setFormNota({ nota: '', observacoes: '', idAvaliacao: '', idAluno: '' });
      setEditandoNota(null);
      setShowFormNota(false);
      setError('');
      
      setTimeout(() => {
        setSuccess('');
        fetchNotasAlunos();
      }, 1500);
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarNota = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta nota?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/avaliacoes-alunos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao deletar nota');
        return;
      }

      setSuccess('Nota deletada com sucesso!');
      setTimeout(() => {
        setSuccess('');
        fetchNotasAlunos();
      }, 1500);
    } catch (err) {
      setError('Erro ao deletar nota');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formAvaliacao.nome || !formAvaliacao.descricao || !formAvaliacao.idCurso || !formAvaliacao.dataAvaliacao) {
      setError('Nome, descrição, curso e data são obrigatórios');
      return;
    }

    if (formAvaliacao.descricao.length > 500) {
      setError('Descrição não pode exceder 500 caracteres');
      return;
    }

    setLoading(true);
    try {
      const method = editandoAvaliacao ? 'PUT' : 'POST';
      const endpoint = editandoAvaliacao ? `/api/avaliacoes/${editandoAvaliacao._id}` : '/api/avaliacoes';
      
      const body = {
        nome: formAvaliacao.nome,
        descricao: formAvaliacao.descricao,
        idCurso: formAvaliacao.idCurso,
        dataAvaliacao: formAvaliacao.dataAvaliacao
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.erro || 'Erro ao salvar avaliação');
        return;
      }

      setSuccess(editandoAvaliacao ? 'Avaliação atualizada com sucesso!' : 'Avaliação criada com sucesso!');
      setFormAvaliacao({ nome: '', descricao: '', idCurso: '', dataAvaliacao: '' });
      setEditandoAvaliacao(null);
      setShowFormAvaliacao(false);
      setError('');
      
      setTimeout(() => {
        setSuccess('');
        fetchAvaliacoesProfessor();
      }, 1500);
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarAvaliacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/avaliacoes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.erro || 'Erro ao deletar avaliação');
        return;
      }

      setSuccess('Avaliação deletada com sucesso!');
      setError('');
      setTimeout(() => {
        setSuccess('');
        fetchAvaliacoesProfessor();
      }, 1500);
    } catch (err) {
      setError('Erro ao deletar avaliação');
    } finally {
      setLoading(false);
    }
  };

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
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Conectando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </>
      ) : currentPage === 'cadastro-aluno' ? (
        /* Cadastro Aluno */
        <>
          <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <img src="/src/assets/school.svg" alt="APTO" className="login-logo" />
                <h1 className="app-title">APTO</h1>
              </div>

              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#222', fontSize: '1.3rem' }}>Cadastro de Aluno</h2>

              <form onSubmit={(e) => handleCadastro(e, 'aluno')} className="login-form">
                <div className="form-group">
                  <label htmlFor="nome-cadastro">Nome</label>
                  <input
                    id="nome-cadastro"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senha-cadastro">Senha</label>
                  <input
                    id="senha-cadastro"
                    type="password"
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmar-senha">Confirmar Senha</label>
                  <input
                    id="confirmar-senha"
                    type="password"
                    placeholder="Confirme a senha"
                    value={confirmSenha}
                    onChange={e => setConfirmSenha(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                <div className="volta-login">
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentPage('login');
                      setError('');
                      setSuccess('');
                      setNome('');
                      setSenha('');
                      setConfirmSenha('');
                    }}
                    className="volta-link"
                  >
                    ← Voltar ao Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : currentPage === 'cadastro-professor' ? (
        /* Cadastro Professor */
        <>
          <div className="login-container">
            <div className="login-card">
              <div className="login-header">
                <img src="/src/assets/school.svg" alt="APTO" className="login-logo" />
                <h1 className="app-title">APTO</h1>
              </div>

              <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#222', fontSize: '1.3rem' }}>Cadastro de Professor</h2>

              <form onSubmit={(e) => handleCadastro(e, 'professor')} className="login-form">
                <div className="form-group">
                  <label htmlFor="nome-prof">Nome</label>
                  <input
                    id="nome-prof"
                    type="text"
                    placeholder="Digite seu nome completo"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="senha-prof">Senha</label>
                  <input
                    id="senha-prof"
                    type="password"
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmar-prof">Confirmar Senha</label>
                  <input
                    id="confirmar-prof"
                    type="password"
                    placeholder="Confirme a senha"
                    value={confirmSenha}
                    onChange={e => setConfirmSenha(e.target.value)}
                    className="form-input"
                    disabled={loading}
                  />
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>

                <div className="volta-login">
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentPage('login');
                      setError('');
                      setSuccess('');
                      setNome('');
                      setSenha('');
                      setConfirmSenha('');
                    }}
                    className="volta-link"
                  >
                    ← Voltar ao Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      ) : (
        /* Dashboard Pages */
        <>
          <header className="dashboard-header-top">
            <div className="header-left">
              <img src="/src/assets/school.svg" alt="APTO" className="header-logo" />
              <span className="header-title">
                {currentPage === 'dashboard-aluno' && 'HOME'}
                {currentPage === 'dashboard-professor' && 'HOME'}
                {currentPage === 'avaliacoes-reforco' && 'AVALIAÇÕES PARA REFORÇO'}
                {currentPage === 'todas-avaliacoes' && 'TODAS AS AVALIAÇÕES'}
                {currentPage === 'professor-cursos' && 'CURSOS'}
                {currentPage === 'professor-avaliacoes' && 'AVALIAÇÕES'}
                {currentPage === 'professor-alunos-avaliacoes' && 'NOTAS DOS ALUNOS'}
                {currentPage === 'professor-alunos' && 'ALUNOS'}
              </span>
            </div>
            {currentPage === 'dashboard-aluno' || currentPage === 'dashboard-professor' ? (
              <button onClick={handleLogout} className="header-logout">Sair</button>
            ) : (
              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentPage(usuario?.tipo === 'aluno' ? 'dashboard-aluno' : 'dashboard-professor'); }} className="header-logout back-button-header">
                ← Voltar
              </button>
            )}
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
                  <div className="info-message">
                    <span className="info-icon">ℹ️</span>
                    <p>Quando você fizer uma nova avaliação para o mesmo curso com nota superior a 7.0, a avaliação deixará de aparecer nesta lista.</p>
                  </div>
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
              </div>
            ) : currentPage === 'dashboard-professor' ? (
              /* Professor Dashboard */
              <div className="dashboard-container">
                <div className="features-grid">
                  <button onClick={() => setCurrentPage('professor-cursos')} className="feature-card">
                    <div className="feature-icon">📚</div>
                    <h3>Gerenciar Cursos</h3>
                    <p>Criar, editar e deletar cursos</p>
                  </button>

                  <button onClick={() => setCurrentPage('professor-avaliacoes')} className="feature-card">
                    <div className="feature-icon">📝</div>
                    <h3>Gerenciar Avaliações</h3>
                    <p>Criar, editar e deletar avaliações</p>
                  </button>

                  <button onClick={() => setCurrentPage('professor-alunos-avaliacoes')} className="feature-card">
                    <div className="feature-icon">👥</div>
                    <h3>Notas dos Alunos</h3>
                    <p>Visualizar e atualizar notas</p>
                  </button>

                  <button onClick={() => setCurrentPage('professor-alunos')} className="feature-card">
                    <div className="feature-icon">🎓</div>
                    <h3>Gerenciar Alunos</h3>
                    <p>Criar e gerenciar alunos</p>
                  </button>

                  <button onClick={() => setCurrentPage('professor-professores')} className="feature-card">
                    <div className="feature-icon">👨‍🏫</div>
                    <h3>Gerenciar Professores</h3>
                    <p>Criar e gerenciar professores</p>
                  </button>
                </div>
              </div>
            ) : currentPage === 'professor-cursos' ? (
              /* Gerenciar Cursos */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <div>
                    <h1 className="page-title">📚 Gerenciar Cursos</h1>
                    <p className="page-subtitle">Crie, edite e organize seus cursos</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!showFormCurso) {
                        fetchCursos();
                      }
                      setShowFormCurso(!showFormCurso);
                      if (editandoCurso) {
                        setEditandoCurso(null);
                        setFormCurso({ nome: '', descricao: '', idCursoReforco: '' });
                      }
                    }}
                    className="add-button"
                  >
                    {showFormCurso ? '✕ Cancelar' : '✚ Novo Curso'}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {showFormCurso && (
                  <form onSubmit={handleSalvarCurso} className="form-container">
                    <h2 className="form-title">{editandoCurso ? 'Editar Curso' : 'Novo Curso'}</h2>
                    <div className="form-group">
                      <label htmlFor="nome-curso">Nome do Curso *</label>
                      <input
                        id="nome-curso"
                        type="text"
                        placeholder="Ex: Matemática Avançada"
                        value={formCurso.nome}
                        onChange={(e) => setFormCurso({ ...formCurso, nome: e.target.value })}
                        className="form-input"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="desc-curso">Descrição *</label>
                      <textarea
                        id="desc-curso"
                        placeholder="Descrição clara do curso (máx. 500 caracteres)"
                        value={formCurso.descricao}
                        onChange={(e) => setFormCurso({ ...formCurso, descricao: e.target.value })}
                        className="form-textarea"
                        disabled={loading}
                        maxLength={500}
                        rows={4}
                        required
                      />
                      <div className="char-count">{formCurso.descricao.length}/500 caracteres</div>
                    </div>

                    <div className="form-group" ref={reforcoDropdownRef}>
                      <label htmlFor="reforco-curso">Curso de Reforço (Opcional)</label>
                      <div className="custom-select">
                        <button
                          type="button"
                          className="custom-select-button"
                          onClick={() => setReforcoDropdownOpen(!reforcoDropdownOpen)}
                          id="reforco-curso"
                        >
                          <span>
                            {formCurso.idCursoReforco 
                              ? cursos.find((c: any) => c._id === formCurso.idCursoReforco)?.nome 
                              : 'Nenhum curso de reforço'}
                          </span>
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        {reforcoDropdownOpen && (
                          <div className="custom-select-options">
                            <button
                              type="button"
                              className={`custom-select-option ${!formCurso.idCursoReforco ? 'active' : ''}`}
                              onClick={() => {
                                setFormCurso({ ...formCurso, idCursoReforco: '' });
                                setReforcoDropdownOpen(false);
                              }}
                            >
                              Nenhum curso de reforço
                            </button>
                            {cursos
                              .filter((c: any) => c._id !== editandoCurso?._id)
                              .map((c: any) => (
                                <button
                                  key={c._id}
                                  type="button"
                                  className={`custom-select-option ${formCurso.idCursoReforco === c._id ? 'active' : ''}`}
                                  onClick={() => {
                                    setFormCurso({ ...formCurso, idCursoReforco: c._id });
                                    setReforcoDropdownOpen(false);
                                  }}
                                >
                                  {c.nome}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Salvando...' : editandoCurso ? '💾 Atualizar Curso' : '✚ Criar Curso'}
                      </button>
                    </div>
                  </form>
                )}

                {!showFormCurso && (
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <input
                      type="text"
                      placeholder="Pesquisar curso por nome..."
                      value={pesquisaCurso}
                      onChange={(e) => pesquisarCurso(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                {loadingCursos ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando cursos...</p>
                  </div>
                ) : cursos.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">📚</div>
                    <h3>Nenhum curso cadastrado</h3>
                    <p>Clique em "Novo Curso" para criar seu primeiro curso</p>
                  </div>
                ) : (
                  <div className="cursos-grid">
                    {cursos.map((curso: any) => (
                      <div key={curso._id} className="curso-card">
                        <div className="curso-content">
                          <h3 className="curso-title">{curso.nome}</h3>
                          <p className="curso-desc">{curso.descricao}</p>
                        </div>

                        {curso.idCursoReforco && (
                          <div className="curso-reforco-badge">
                            <span className="reforco-label">🎓 Curso de Reforço:</span>
                            <span className="reforco-name">{curso.idCursoReforco?.nome}</span>
                          </div>
                        )}

                        <div className="curso-footer">
                          <button
                            onClick={() => {
                              setEditandoCurso(curso);
                              setFormCurso({
                                nome: curso.nome,
                                descricao: curso.descricao,
                                idCursoReforco: curso.idCursoReforco?._id || ''
                              });
                              setShowFormCurso(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-icon btn-edit"
                            title="Editar curso"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletarCurso(curso._id)}
                            className="btn-icon btn-delete"
                            title="Deletar curso"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : currentPage === 'professor-avaliacoes' ? (
              /* Gerenciar Avaliações */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <div>
                    <h1 className="page-title">📝 Gerenciar Avaliações</h1>
                    <p className="page-subtitle">Crie, edite e organize suas avaliações</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!showFormAvaliacao) {
                        fetchAvaliacoesProfessor();
                      }
                      setShowFormAvaliacao(!showFormAvaliacao);
                      if (editandoAvaliacao) {
                        setEditandoAvaliacao(null);
                        setFormAvaliacao({ nome: '', descricao: '', idCurso: '', dataAvaliacao: '' });
                      }
                    }}
                    className="add-button"
                  >
                    {showFormAvaliacao ? '✕ Cancelar' : '✚ Nova Avaliação'}
                  </button>
                </div>

                {!showFormAvaliacao && (
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <input
                      type="text"
                      placeholder="Pesquisar avaliação por nome..."
                      value={pesquisaAvaliacao}
                      onChange={(e) => pesquisarAvaliacao(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {showFormAvaliacao && (
                  <form onSubmit={handleSalvarAvaliacao} className="form-container">
                    <h2 className="form-title">{editandoAvaliacao ? 'Editar Avaliação' : 'Nova Avaliação'}</h2>
                    <div className="form-group">
                      <label htmlFor="nome-avaliacao">Nome da Avaliação *</label>
                      <input
                        id="nome-avaliacao"
                        type="text"
                        placeholder="Ex: Prova 1º Bimestre"
                        value={formAvaliacao.nome}
                        onChange={(e) => setFormAvaliacao({ ...formAvaliacao, nome: e.target.value })}
                        className="form-input"
                        disabled={loadingAvaliacoesProfessor}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="descricao-avaliacao">Descrição *</label>
                      <textarea
                        id="descricao-avaliacao"
                        placeholder="Descrição clara da avaliação (máx. 500 caracteres)"
                        value={formAvaliacao.descricao}
                        onChange={(e) => setFormAvaliacao({
                          ...formAvaliacao,
                          descricao: e.target.value.substring(0, 500)
                        })}
                        className="form-textarea"
                        disabled={loadingAvaliacoesProfessor}
                        maxLength={500}
                        rows={4}
                        required
                      />
                      <div className="char-count">{formAvaliacao.descricao.length}/500 caracteres</div>
                    </div>

                    <div className="form-group" ref={cursoDropdownRef}>
                      <label htmlFor="curso-avaliacao">Curso *</label>
                      <div className="custom-select">
                        <button
                          type="button"
                          className="custom-select-button"
                          onClick={() => setCursoDropdownOpen(!cursoDropdownOpen)}
                          id="curso-avaliacao"
                        >
                          <span>
                            {formAvaliacao.idCurso 
                              ? cursos.find((c: any) => c._id === formAvaliacao.idCurso)?.nome 
                              : 'Selecione um curso'}
                          </span>
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        {cursoDropdownOpen && (
                          <div className="custom-select-options">
                            {cursos.length === 0 ? (
                              <div className="custom-select-option" style={{ color: '#999' }}>
                                Nenhum curso disponível
                              </div>
                            ) : (
                              cursos.map((curso: any) => (
                                <button
                                  key={curso._id}
                                  type="button"
                                  className={`custom-select-option ${formAvaliacao.idCurso === curso._id ? 'active' : ''}`}
                                  onClick={() => {
                                    setFormAvaliacao({ ...formAvaliacao, idCurso: curso._id });
                                    setCursoDropdownOpen(false);
                                  }}
                                >
                                  {curso.nome}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="data-avaliacao">Data da Avaliação *</label>
                      <input
                        id="data-avaliacao"
                        type="date"
                        value={formAvaliacao.dataAvaliacao}
                        onChange={(e) =>
                          setFormAvaliacao({ ...formAvaliacao, dataAvaliacao: e.target.value })
                        }
                        className="form-input"
                        disabled={loadingAvaliacoesProfessor}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={loadingAvaliacoesProfessor} className="submit-button">
                        {loadingAvaliacoesProfessor ? 'Salvando...' : editandoAvaliacao ? '💾 Atualizar Avaliação' : '✚ Criar Avaliação'}
                      </button>
                    </div>
                  </form>
                )}

                {loadingAvaliacoesProfessor ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando avaliações...</p>
                  </div>
                ) : avaliacoesProfessor.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">📝</div>
                    <h3>Nenhuma avaliação cadastrada</h3>
                    <p>Clique em "Nova Avaliação" para criar sua primeira avaliação</p>
                  </div>
                ) : (
                  <div className="avaliacoes-grid">
                    {avaliacoesProfessor.map((avaliacao: any) => (
                      <div key={avaliacao._id} className="avaliacao-card">
                        <div className="avaliacao-content">
                          <h3 className="avaliacao-title">{avaliacao.nome}</h3>
                          <p className="avaliacao-desc">{avaliacao.descricao}</p>
                        </div>

                        <div className="avaliacao-info">
                          <div className="info-item">
                            <span className="info-label">📅 Data:</span>
                            <span className="info-value">{new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="info-item">
                            <span className="info-label">📚 Curso:</span>
                            <span className="info-value">{avaliacao.idCurso?.nome || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="avaliacao-footer">
                          <button
                            onClick={() => {
                              setEditandoAvaliacao(avaliacao);
                              setFormAvaliacao({
                                nome: avaliacao.nome,
                                descricao: avaliacao.descricao,
                                idCurso: avaliacao.idCurso?._id || '',
                                dataAvaliacao: avaliacao.dataAvaliacao.split('T')[0]
                              });
                              setShowFormAvaliacao(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-icon btn-edit"
                            title="Editar avaliação"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletarAvaliacao(avaliacao._id)}
                            className="btn-icon btn-delete"
                            title="Deletar avaliação"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : currentPage === 'professor-alunos-avaliacoes' ? (
              /* Notas dos Alunos */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <div>
                    <h1 className="page-title">📊 Notas dos Alunos</h1>
                    <p className="page-subtitle">Registre e acompanhe as notas dos alunos</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!showFormNota) {
                        fetchAvaliacoesList();
                        fetchAlunosList();
                      }
                      setShowFormNota(!showFormNota);
                      if (editandoNota) {
                        setEditandoNota(null);
                        setFormNota({ nota: '', observacoes: '', idAvaliacao: '', idAluno: '' });
                      }
                    }}
                    className="add-button"
                  >
                    {showFormNota ? '✕ Cancelar' : '✚ Nova Nota'}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {showFormNota && (
                  <form onSubmit={handleSalvarNota} className="form-container">
                    <h2 className="form-title">{editandoNota ? 'Editar Nota' : 'Nova Nota'}</h2>
                    
                    <div className="form-group" ref={avaliacaoDropdownRef} style={{display: editandoNota ? 'none' : 'block'}}>
                      <label htmlFor="selectAvaliacao">Avaliação *</label>
                      <div className="custom-select">
                        <button
                          type="button"
                          className="custom-select-button"
                          onClick={() => setAvaliacaoDropdownOpen(!avaliacaoDropdownOpen)}
                          id="selectAvaliacao"
                          disabled={loading || !!editandoNota}
                        >
                          <span>
                            {formNota.idAvaliacao 
                              ? avaliacoesList.find((a: any) => a._id === formNota.idAvaliacao)?.nome 
                              : 'Selecione uma avaliação...'}
                          </span>
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        {avaliacaoDropdownOpen && !editandoNota && (
                          <div className="custom-select-options">
                            <button
                              type="button"
                              className={`custom-select-option ${!formNota.idAvaliacao ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setFormNota({ ...formNota, idAvaliacao: '' });
                                setAvaliacaoDropdownOpen(false);
                              }}
                            >
                              Selecione uma avaliação...
                            </button>
                            {avaliacoesList.map((avaliacao: any) => (
                              <button
                                key={avaliacao._id}
                                type="button"
                                className={`custom-select-option ${formNota.idAvaliacao === avaliacao._id ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormNota({ ...formNota, idAvaliacao: avaliacao._id });
                                  setAvaliacaoDropdownOpen(false);
                                }}
                              >
                                {avaliacao.nome}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group" ref={alunoDropdownRef} style={{display: editandoNota ? 'none' : 'block'}}>
                      <label htmlFor="selectAluno">Aluno *</label>
                      <div className="custom-select">
                        <button
                          type="button"
                          className="custom-select-button"
                          onClick={() => setAlunoDropdownOpen(!alunoDropdownOpen)}
                          id="selectAluno"
                          disabled={loading || !!editandoNota}
                        >
                          <span>
                            {formNota.idAluno 
                              ? alunosList.find((a: any) => a._id === formNota.idAluno)?.nome 
                              : 'Selecione um aluno...'}
                          </span>
                          <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        {alunoDropdownOpen && !editandoNota && (
                          <div className="custom-select-options">
                            <button
                              type="button"
                              className={`custom-select-option ${!formNota.idAluno ? 'active' : ''}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setFormNota({ ...formNota, idAluno: '' });
                                setAlunoDropdownOpen(false);
                              }}
                            >
                              Selecione um aluno...
                            </button>
                            {alunosList.map((aluno: any) => (
                              <button
                                key={aluno._id}
                                type="button"
                                className={`custom-select-option ${formNota.idAluno === aluno._id ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFormNota({ ...formNota, idAluno: aluno._id });
                                  setAlunoDropdownOpen(false);
                                }}
                              >
                                {aluno.nome}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="inputNota">Nota (0-10) *</label>
                      <input
                        id="inputNota"
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formNota.nota}
                        onChange={(e) => setFormNota({ ...formNota, nota: e.target.value })}
                        className="form-input"
                        disabled={loading}
                        required
                        placeholder="Ex: 8.5"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="textareaObservacoes">
                        Observações
                      </label>
                      <textarea
                        id="textareaObservacoes"
                        value={formNota.observacoes}
                        onChange={(e) => setFormNota({ ...formNota, observacoes: e.target.value.slice(0, 500) })}
                        className="form-textarea"
                        disabled={loading}
                        maxLength={500}
                        placeholder="Observações sobre o desempenho do aluno (máx. 500 caracteres)"
                        rows={4}
                      />
                      <div className="char-count">{formNota.observacoes.length}/500 caracteres</div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Salvando...' : editandoNota ? '💾 Atualizar Nota' : '✚ Registrar Nota'}
                      </button>
                    </div>
                  </form>
                )}

                {!showFormNota && (
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <input
                      type="text"
                      placeholder="Pesquisar nota por aluno ou avaliação..."
                      value={pesquisaNota}
                      onChange={(e) => setPesquisaNota(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                {loadingNotasAlunos ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando notas...</p>
                  </div>
                ) : notasAlunos.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">📊</div>
                    <h3>Nenhuma nota registrada</h3>
                    <p>Clique em "Nova Nota" para registrar a primeira nota</p>
                  </div>
                ) : (
                  <div className="cursos-grid">
                    {notasAlunos
                      .filter((nota: any) => {
                        const searchTerm = pesquisaNota.toLowerCase();
                        return (
                          nota.idAluno?.nome?.toLowerCase().includes(searchTerm) ||
                          nota.idAvaliacao?.nome?.toLowerCase().includes(searchTerm)
                        );
                      })
                      .map((nota: any) => (
                        <div key={nota._id} className="curso-card nota-card-container">
                          <div className="curso-content">
                            <h3 className="curso-title">{nota.idAluno?.nome || 'N/A'}</h3>
                            <p className="curso-desc" style={{fontWeight: '600', color: '#555', marginBottom: '0.25rem'}}>{nota.idAvaliacao?.nome || 'N/A'}</p>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', gap: '1rem'}}>
                              <div style={{fontSize: '0.8rem', color: '#888'}}>
                                📅 {nota.idAvaliacao?.dataAvaliacao ? new Date(nota.idAvaliacao.dataAvaliacao).toLocaleDateString('pt-BR') : 'Data não informada'}
                              </div>
                              <div style={{fontSize: '0.9rem', color: '#666', fontWeight: '600'}}>Nota: {nota.nota}</div>
                            </div>
                            {nota.observacoes && (
                              <div style={{fontSize: '0.8rem', color: '#777', marginTop: '0.5rem', fontStyle: 'italic'}}>
                                {nota.observacoes}
                              </div>
                            )}
                          </div>

                          <div className="curso-footer">
                            <button
                              onClick={() => {
                                setEditandoNota(nota);
                                setFormNota({
                                  nota: nota.nota.toString(),
                                  observacoes: nota.observacoes || '',
                                  idAvaliacao: nota.idAvaliacao?._id || '',
                                  idAluno: nota.idAluno?._id || ''
                                });
                                setShowFormNota(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="btn-icon btn-edit"
                              title="Editar nota"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeletarNota(nota._id)}
                              className="btn-icon btn-delete"
                              title="Deletar nota"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : currentPage === 'professor-alunos' ? (
              /* Gerenciar Alunos */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <div>
                    <h1 className="page-title">👥 Gerenciar Alunos</h1>
                    <p className="page-subtitle">Crie, edite e organize seus alunos</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (!showFormAluno) {
                        fetchAlunos();
                      }
                      setShowFormAluno(!showFormAluno);
                      if (editandoAluno) {
                        setEditandoAluno(null);
                        setFormAluno({ nome: '', senha: '' });
                      }
                    }}
                    className="add-button"
                  >
                    {showFormAluno ? '✕ Cancelar' : '✚ Novo Aluno'}
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {showFormAluno && (
                  <form onSubmit={handleSalvarAluno} className="form-container">
                    <h2 className="form-title">{editandoAluno ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                    <div className="form-group">
                      <label htmlFor="nome-aluno">Nome do Aluno *</label>
                      <input
                        id="nome-aluno"
                        type="text"
                        placeholder="Ex: João Silva"
                        value={formAluno.nome}
                        onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })}
                        className="form-input"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="senha-aluno">Senha *</label>
                      <input
                        id="senha-aluno"
                        type="password"
                        placeholder="Mínimo 4 caracteres"
                        value={formAluno.senha}
                        onChange={(e) => setFormAluno({ ...formAluno, senha: e.target.value })}
                        className="form-input"
                        disabled={loading}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Salvando...' : editandoAluno ? '💾 Atualizar Aluno' : '✚ Criar Aluno'}
                      </button>
                    </div>
                  </form>
                )}

                {!showFormAluno && (
                  <div className="form-group" style={{ marginBottom: '2rem' }}>
                    <input
                      type="text"
                      placeholder="Pesquisar aluno por nome..."
                      value={pesquisaAluno}
                      onChange={(e) => pesquisarAluno(e.target.value)}
                      className="form-input"
                    />
                  </div>
                )}

                {loadingAlunos ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando alunos...</p>
                  </div>
                ) : alunos.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-icon">🎓</div>
                    <h3>Nenhum aluno cadastrado</h3>
                    <p>Clique em "Novo Aluno" para criar seu primeiro aluno</p>
                  </div>
                ) : (
                  <div className="cursos-grid">
                    {alunos.map((aluno: any) => (
                      <div key={aluno._id} className="curso-card">
                        <div className="curso-content">
                          <h3 className="curso-title">{aluno.nome}</h3>
                          <p className="curso-desc" style={{fontSize: '0.85rem', color: '#999', marginTop: '0.5rem'}}>
                            ID: {aluno._id}
                          </p>
                        </div>

                        <div className="curso-footer">
                          <button
                            onClick={() => {
                              setEditandoAluno(aluno);
                              setFormAluno({
                                nome: aluno.nome,
                                senha: ''
                              });
                              setShowFormAluno(true);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn-icon btn-edit"
                            title="Editar aluno"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeletarAluno(aluno._id)}
                            className="btn-icon btn-delete"
                            title="Deletar aluno"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : currentPage === 'professor-professores' ? (
              /* Gerenciar Professores */
              <div className="avaliacoes-container">
                <div className="page-header">
                  <h1 className="page-title">Gerenciar Professores</h1>
                </div>
                <div className="empty-state-card">
                  <div className="empty-icon">👨‍🏫</div>
                  <p>Funcionalidade em desenvolvimento...</p>
                </div>
              </div>
            ) : (
              /* Fallback */
              <div className="dashboard-container">
                <p style={{ textAlign: 'center', color: '#999' }}>Página não encontrada...</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
