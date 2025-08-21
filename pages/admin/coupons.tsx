import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { Coupon, CouponStats } from '../../src/types/coupon';
import styles from './coupons.module.css';

interface CouponsResponse {
  coupons: Coupon[];
  stats?: CouponStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface CouponFormData {
  code: string;
  discountValue?: number;
  discountPercentage?: number;
  maxUses?: number;
  expiresAt?: string;
}

const CouponsAdminPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<
    CouponsResponse['pagination'] | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showCouponDetails, setShowCouponDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setError('Você precisa estar logado para acessar esta página.');
      setLoading(false);
      return;
    }
    fetchCoupons();
  }, [currentPage, onlyMine, isAuthenticated]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        includeStats: 'true',
        ...(onlyMine && { onlyMine: 'true' }),
      });

      const response = await fetch(`/api/coupons?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar cupons');
      }

      const data: CouponsResponse = await response.json();
      setCoupons(data.coupons);
      setStats(data.stats || null);
      setPagination(data.pagination);
    } catch (error) {
      setError('Erro ao carregar cupons');
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (formData: CouponFormData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setShowCreateForm(false);
      fetchCoupons();
      alert('Cupom criado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao criar cupom: ${error.message}`);
    }
  };

  const handleToggleCouponStatus = async (
    couponId: string,
    isActive: boolean
  ) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchCoupons();
      alert(`Cupom ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error: any) {
      alert(`Erro ao alterar status do cupom: ${error.message}`);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchCoupons();
      alert('Cupom deletado com sucesso!');
    } catch (error: any) {
      alert(`Erro ao deletar cupom: ${error.message}`);
    }
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountValue) {
      return `R$ ${coupon.discountValue.toFixed(2)}`;
    } else if (coupon.discountPercentage) {
      return `${coupon.discountPercentage}%`;
    }
    return 'N/A';
  };

  const getStatusBadgeClass = (coupon: Coupon) => {
    if (!coupon.isActive) return `${styles.badge} ${styles.badgeInactive}`;
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return `${styles.badge} ${styles.badgeExpired}`;
    }
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
      return `${styles.badge} ${styles.badgeExhausted}`;
    }
    return `${styles.badge} ${styles.badgeActive}`;
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return 'Inativo';
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
      return 'Expirado';
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) return 'Esgotado';
    return 'Ativo';
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Verificando permissões...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h1>Acesso Negado</h1>
          <p>Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gerenciamento de Cupons</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className={styles.createButton}
        >
          Criar Cupom
        </button>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalCoupons}</div>
            <div className={styles.statLabel}>Total de Cupons</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.activeCoupons}</div>
            <div className={styles.statLabel}>Cupons Ativos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalUses}</div>
            <div className={styles.statLabel}>Total de Usos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>
              R${' '}
              {stats.totalDiscountGiven
                ? stats.totalDiscountGiven.toFixed(2)
                : '0.00'}
            </div>
            <div className={styles.statLabel}>Desconto Total</div>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <label className={styles.checkboxLabel}>
          <input
            type='checkbox'
            checked={onlyMine}
            onChange={e => {
              setOnlyMine(e.target.checked);
              setCurrentPage(1);
            }}
          />
          Mostrar apenas meus cupons
        </label>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando cupons...</div>
      ) : error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : (
        <>
          <div className={styles.couponsTable}>
            <div className={styles.tableHeader}>
              <div>Código</div>
              <div>Desconto</div>
              <div>Criado por</div>
              <div>Usos</div>
              <div>Status</div>
              <div>Criado em</div>
              <div>Ações</div>
            </div>
            {coupons.map(coupon => (
              <div key={coupon.id} className={styles.tableRow}>
                <div className={styles.couponCode}>{coupon.code}</div>
                <div>{formatDiscount(coupon)}</div>
                <div>{coupon.creator?.name}</div>
                <div>
                  {coupon.uses}
                  {coupon.maxUses && ` / ${coupon.maxUses}`}
                </div>
                <div>
                  <span className={getStatusBadgeClass(coupon)}>
                    {getStatusText(coupon)}
                  </span>
                </div>
                <div>{new Date(coupon.createdAt).toLocaleDateString()}</div>
                <div className={styles.actions}>
                  <button
                    onClick={() => {
                      setSelectedCoupon(coupon);
                      setShowCouponDetails(true);
                    }}
                    className={styles.detailsButton}
                  >
                    Detalhes
                  </button>
                  <button
                    onClick={() =>
                      handleToggleCouponStatus(coupon.id, !coupon.isActive)
                    }
                    className={
                      coupon.isActive
                        ? styles.deactivateButton
                        : styles.activateButton
                    }
                  >
                    {coupon.isActive ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon.id)}
                    className={styles.deleteButton}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className={styles.paginationButton}
              >
                Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={styles.paginationButton}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {showCreateForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Criar Novo Cupom</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data: CouponFormData = {
                  code: formData.get('code') as string,
                };

                const discountType = formData.get('discountType') as string;
                if (discountType === 'value') {
                  data.discountValue = Number(formData.get('discountValue'));
                } else {
                  data.discountPercentage = Number(
                    formData.get('discountPercentage')
                  );
                }

                const maxUses = formData.get('maxUses') as string;
                if (maxUses) {
                  data.maxUses = Number(maxUses);
                }

                const expiresAt = formData.get('expiresAt') as string;
                if (expiresAt) {
                  data.expiresAt = expiresAt;
                }

                handleCreateCoupon(data);
              }}
              className={styles.form}
            >
              <div className={styles.formGroup}>
                <label htmlFor='code' className={styles.label}>
                  Código do Cupom
                </label>
                <input
                  type='text'
                  id='code'
                  name='code'
                  required
                  className={styles.input}
                  placeholder='Digite o código do cupom'
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Desconto</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='discountType'
                      value='value'
                      defaultChecked
                    />
                    Valor fixo (R$)
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type='radio'
                      name='discountType'
                      value='percentage'
                    />
                    Porcentagem (%)
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='discountValue' className={styles.label}>
                  Valor do Desconto
                </label>
                <input
                  type='number'
                  id='discountValue'
                  name='discountValue'
                  step='0.01'
                  min='0'
                  className={styles.input}
                  placeholder='Ex: 10.00'
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='discountPercentage' className={styles.label}>
                  Porcentagem do Desconto
                </label>
                <input
                  type='number'
                  id='discountPercentage'
                  name='discountPercentage'
                  min='1'
                  max='100'
                  className={styles.input}
                  placeholder='Ex: 15'
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='maxUses' className={styles.label}>
                  Máximo de Usos (opcional)
                </label>
                <input
                  type='number'
                  id='maxUses'
                  name='maxUses'
                  min='1'
                  className={styles.input}
                  placeholder='Deixe vazio para ilimitado'
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor='expiresAt' className={styles.label}>
                  Data de Expiração (opcional)
                </label>
                <input
                  type='datetime-local'
                  id='expiresAt'
                  name='expiresAt'
                  className={styles.input}
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type='button'
                  onClick={() => setShowCreateForm(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button type='submit' className={styles.submitButton}>
                  Criar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCouponDetails && selectedCoupon && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do Cupom: {selectedCoupon.code}</h2>
              <button
                onClick={() => {
                  setShowCouponDetails(false);
                  setSelectedCoupon(null);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.couponDetails}>
              <div className={styles.detailItem}>
                <strong>Código:</strong> {selectedCoupon.code}
              </div>
              <div className={styles.detailItem}>
                <strong>Desconto:</strong> {formatDiscount(selectedCoupon)}
              </div>
              <div className={styles.detailItem}>
                <strong>Criado por:</strong> {selectedCoupon.creator?.name} (
                {selectedCoupon.creator?.email})
              </div>
              <div className={styles.detailItem}>
                <strong>Usos:</strong> {selectedCoupon.uses}
                {selectedCoupon.maxUses && ` / ${selectedCoupon.maxUses}`}
              </div>
              <div className={styles.detailItem}>
                <strong>Status:</strong>
                <span className={getStatusBadgeClass(selectedCoupon)}>
                  {getStatusText(selectedCoupon)}
                </span>
              </div>
              {selectedCoupon.expiresAt && (
                <div className={styles.detailItem}>
                  <strong>Expira em:</strong>{' '}
                  {new Date(selectedCoupon.expiresAt).toLocaleString()}
                </div>
              )}
              <div className={styles.detailItem}>
                <strong>Criado em:</strong>{' '}
                {new Date(selectedCoupon.createdAt).toLocaleString()}
              </div>

              {selectedCoupon.users && selectedCoupon.users.length > 0 && (
                <div className={styles.usersSection}>
                  <strong>
                    Usuários que usaram ({selectedCoupon.users.length}):
                  </strong>
                  <div className={styles.usersList}>
                    {selectedCoupon.users.map(user => (
                      <div key={user.id} className={styles.userItem}>
                        {user.avatar && (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className={styles.userAvatar}
                          />
                        )}
                        <div>
                          <div className={styles.userName}>{user.name}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsAdminPage;
