import { useEffect, useState } from 'react'
import { useAuth } from '../context/auth-context.js'
import { createUser, getUsers, resetUserPassword, updateUser } from '../services/userApi.js'
import { PASSWORD_HINT, VAI_TRO, formatDate, passwordError } from '../constants.js'
import { LoadingBlock, ErrorBlock } from '../components/PageState.jsx'
import Modal from '../components/Modal.jsx'

const PAGE_SIZE = 10
const emptyNew = { hoTen: '', email: '', matKhau: '', vaiTro: 'can_bo' }

export default function Users() {
  const { user: me } = useAuth()
  const [data, setData] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retry, setRetry] = useState(0)
  const [f, setF] = useState({ keyword: '', role: '', page: 1 })
  const [toast, setToast] = useState('')
  const [dialog, setDialog] = useState(null) // { type: 'create' } | { type: 'reset', user }

  useEffect(() => {
    let ignore = false
    setLoading(true)
    getUsers({ ...f, pageSize: PAGE_SIZE })
      .then((d) => { if (!ignore) { setData(d); setError(false); setLoading(false) } })
      .catch(() => { if (!ignore) { setError(true); setLoading(false) } })
    return () => { ignore = true }
  }, [f, retry])

  const reload = () => setRetry((n) => n + 1)
  const flash = (text) => { setToast(text); setTimeout(() => setToast(''), 2500) }
  const set = (patch) => setF((p) => ({ ...p, page: 1, ...patch }))

  const patch = async (u, body, okText) => {
    try {
      await updateUser(u.id, body)
      flash(okText)
      reload()
    } catch (err) {
      flash(err.message)
    }
  }

  const pages = Math.max(1, Math.ceil(data.total / PAGE_SIZE))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Người dùng</h1>
          <p>Quản lý tài khoản, vai trò và quyền truy cập</p>
        </div>
        <div className="head-actions">
          <button className="btn btn-primary" onClick={() => setDialog({ type: 'create' })}>+ Tạo tài khoản</button>
        </div>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      <div className="card flush">
        <div className="toolbar">
          <input className="field-input grow" placeholder="Tìm theo họ tên hoặc email..." aria-label="Tìm người dùng"
            value={f.keyword} onChange={(e) => set({ keyword: e.target.value })} />
          <select className="field-select" aria-label="Lọc theo vai trò" value={f.role} onChange={(e) => set({ role: e.target.value })}>
            <option value="">Mọi vai trò</option>
            {Object.entries(VAI_TRO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {loading ? (
          <LoadingBlock rows={5} />
        ) : error ? (
          <ErrorBlock onRetry={reload} />
        ) : data.items.length === 0 ? (
          <div className="empty-state">Không có người dùng nào phù hợp</div>
        ) : (
          <div className="table-wrap">
            <table className="stack">
              <thead>
                <tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Ngày tạo</th><th><span className="sr-only">Thao tác</span></th></tr>
              </thead>
              <tbody>
                {data.items.map((u) => {
                  const self = u.id === me.id
                  return (
                    <tr key={u.id}>
                      <td className="cell-title">{u.hoTen}{self && <span className="muted"> (bạn)</span>}</td>
                      <td className="mono" data-label="Email">{u.email}</td>
                      <td data-label="Vai trò">
                        <select className="field-select select-sm" aria-label={`Vai trò của ${u.hoTen}`} value={u.vaiTro} disabled={self}
                          onChange={(e) => patch(u, { vaiTro: e.target.value }, 'Đã đổi vai trò')}>
                          {Object.entries(VAI_TRO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      <td data-label="Trạng thái">
                        <span className={`badge ${u.hoatDong ? 'status-xong' : 'status-huy'}`}>{u.hoatDong ? 'Hoạt động' : 'Đã khóa'}</span>
                      </td>
                      <td className="nowrap" data-label="Ngày tạo">{formatDate(u.ngayTao)}</td>
                      <td className="row-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setDialog({ type: 'reset', user: u })}>Đặt lại mật khẩu</button>
                        {!self && (
                          <button className="btn btn-secondary btn-sm" onClick={() => patch(u, { hoatDong: !u.hoatDong }, u.hoatDong ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản')}>
                            {u.hoatDong ? 'Khóa' : 'Mở khóa'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <span className="muted">{data.total} người dùng</span>
          <div>
            <button className="btn btn-secondary btn-sm" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>← Trước</button>
            <span className="pager-info">Trang {f.page}/{pages}</span>
            <button className="btn btn-secondary btn-sm" disabled={f.page >= pages} onClick={() => setF({ ...f, page: f.page + 1 })}>Sau →</button>
          </div>
        </div>
      </div>

      {dialog?.type === 'create' && (
        <CreateUserDialog onClose={() => setDialog(null)} onDone={() => { setDialog(null); flash('Đã tạo tài khoản'); reload() }} />
      )}
      {dialog?.type === 'reset' && (
        <ResetPasswordDialog user={dialog.user} onClose={() => setDialog(null)} onDone={() => { setDialog(null); flash('Đã đặt lại mật khẩu') }} />
      )}
    </>
  )
}

function CreateUserDialog({ onClose, onDone }) {
  const [form, setForm] = useState(emptyNew)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    const problem = form.hoTen.trim().length < 2 ? 'Họ tên phải từ 2 ký tự.'
      : !/^\S+@\S+\.\S+$/.test(form.email.trim()) ? 'Email không hợp lệ.'
      : passwordError(form.matKhau)
    if (problem) return setError(problem)
    setError('')
    setSaving(true)
    try {
      await createUser(form)
      onDone()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Tạo tài khoản" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        {error && <div className="field-error" role="alert">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="nu-hoTen">Họ và tên</label>
          <input className="field-input" id="nu-hoTen" name="hoTen" value={form.hoTen} onChange={onChange} autoFocus />
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="nu-email">Email</label>
          <input className="field-input" id="nu-email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="off" />
        </div>
        <div className="field-row">
          <div className="field-group">
            <label className="field-label" htmlFor="nu-vaiTro">Vai trò</label>
            <select className="field-select" id="nu-vaiTro" name="vaiTro" value={form.vaiTro} onChange={onChange}>
              {Object.entries(VAI_TRO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label className="field-label" htmlFor="nu-matKhau">Mật khẩu ban đầu</label>
            <input className="field-input" id="nu-matKhau" name="matKhau" type="password" value={form.matKhau} onChange={onChange} autoComplete="new-password" />
          </div>
        </div>
        <span className="field-hint">{PASSWORD_HINT}. Hãy nhắc người dùng đổi mật khẩu sau khi đăng nhập.</span>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang tạo...' : 'Tạo tài khoản'}</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </Modal>
  )
}

function ResetPasswordDialog({ user, onClose, onDone }) {
  const [matKhau, setMatKhau] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    const problem = passwordError(matKhau)
    if (problem) return setError(problem)
    setError('')
    setSaving(true)
    try {
      await resetUserPassword(user.id, matKhau)
      onDone()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal title="Đặt lại mật khẩu" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate>
        <p>Đặt mật khẩu mới cho <b>{user.hoTen}</b> ({user.email}). Người này sẽ bị đăng xuất khỏi mọi thiết bị.</p>
        {error && <div className="field-error" role="alert">{error}</div>}
        <div className="field-group">
          <label className="field-label" htmlFor="rp-matKhau">Mật khẩu mới</label>
          <input className="field-input" id="rp-matKhau" type="password" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} autoComplete="new-password" autoFocus />
          <span className="field-hint">{PASSWORD_HINT}</span>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Đặt lại'}</button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Hủy</button>
        </div>
      </form>
    </Modal>
  )
}
