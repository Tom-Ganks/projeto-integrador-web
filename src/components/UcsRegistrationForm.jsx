import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, GraduationCap } from 'lucide-react';


const UcsRegistrationForm = ({ cursos = [], onSubmit, initialData = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    nomeuc: initialData?.nomeuc || '',
    cargahoraria: initialData?.cargahoraria?.toString() || '',
    idcurso: initialData?.idcurso?.toString() || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nomeuc: initialData.nomeuc || '',
        cargahoraria: initialData.cargahoraria?.toString() || '',
        idcurso: initialData.idcurso?.toString() || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nomeuc.trim()) {
      newErrors.nomeuc = 'Nome da UC é obrigatório';
    } else if (formData.nomeuc.trim().length < 3) {
      newErrors.nomeuc = 'Nome da UC deve ter pelo menos 3 caracteres';
    }

    if (!formData.cargahoraria) {
      newErrors.cargahoraria = 'Carga horária é obrigatória';
    } else {
      const cargaHorariaNum = parseInt(formData.cargahoraria);
      if (cargaHorariaNum < 1 || cargaHorariaNum > 2000) {
        newErrors.cargahoraria = 'Carga horária deve estar entre 1 e 2000 horas';
      }
    }

    if (!formData.idcurso) {
      newErrors.idcurso = 'Curso é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitMessage({
        type: 'error',
        text: 'Por favor, corrija os erros antes de continuar.'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage({ type: '', text: '' });


    try {
      // Converter para números antes de enviar
      const dataToSubmit = {
        nomeuc: formData.nomeuc,
         cargahoraria: parseInt(formData.cargahoraria),
         idcurso: parseInt(formData.idcurso) 
      };

      await onSubmit(dataToSubmit);
      setSubmitMessage({
        type: 'success',
        text: initialData ? 'Unidade Curricular atualizada com sucesso!' : 'Unidade Curricular registrada com sucesso!'
      });
      if (!initialData) {
        clearForm();
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: `Erro ao ${initialData ? 'atualizar' : 'registrar'} UC: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      nomeuc: '',
      cargahoraria: '',
      idcurso: ''
    });
    setErrors({});
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nomeuc" className="form-label">
            <BookOpen size={16} />
            Nome
          </label>
          <input
            type="text"
            className={`form-input ${errors.nomeuc ? 'error' : ''}`}
            id="nomeuc"
            name="nomeuc"
            value={formData.nomeuc}
            onChange={handleChange}
            placeholder="Nome da UC"
          />
          {errors.nomeuc && (
            <div className="error-message">{errors.nomeuc}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="cargahoraria" className="form-label">
            <Clock size={16} />
            Carga Horária
          </label>
          <input
            type="number"
            className={`form-input ${errors.cargahoraria ? 'error' : ''}`}
            id="cargahoraria"
            name="cargahoraria"
            value={formData.cargahoraria}
            onChange={handleChange}
            min="1"
            max="500"
            placeholder="Carga Horária em horas"
          />
          {errors.cargahoraria && (
            <div className="error-message">{errors.cargahoraria}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="idcurso" className="form-label">
            <GraduationCap size={16} />
            Curso
          </label>
          <select
            className={`form-select ${errors.idcurso ? 'error' : ''}`}
            id="idcurso"
            name="idcurso"
            value={formData.idcurso}
            onChange={handleChange}
          >
            <option value="">Selecione um curso</option>
            {cursos.map(curso => (
              <option key={curso.idcurso} value={curso.idcurso}>
                {curso.nomecurso}
              </option>
            ))}
          </select>
          {errors.idcurso && (
            <div className="error-message">{errors.idcurso}</div>
          )}
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="btn-save"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : `💾 ${initialData ? 'Atualizar' : 'Salvar'} Unidade Curricular`}
          </button>
        </div>
      </form>

      {submitMessage.text && (
        <div className={`message ${submitMessage.type}`}>
          {submitMessage.text}
        </div>
      )}
    </div>
  );
};

export default UcsRegistrationForm;