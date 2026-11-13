import { useCallback, useEffect, useRef, useState } from 'react'
import { IconHelp, IconUserCheck } from '../components/Icons.jsx'
import { LoadingBlock } from '../components/PageState.jsx'
import { HOTLINE, SUPPORT_EMAIL } from '../constants.js'
import { askAssistant, getSupportStatus, setDuty } from '../services/supportApi.js'
import '../support.css'

const KHU_VUC = [
  { value: 'bac', label: 'Miền Bắc (PA05 Hà Nội)' },
  { value: 'nam', label: 'Miền Trung, Nam (PA05 TP.HCM)' },
]
const GOI_Y = [
  'Làm sao tiếp nhận và xử lý một báo cáo mới?',
  'Cách tra cứu số điện thoại hoặc số tài khoản nghi vấn?',
  'Soạn và gửi duyệt cảnh báo phát hành như thế nào?',
  'Tôi không đăng nhập được thì làm gì?',
]
const TOI_DA_NGU_CANH = 20 // khớp giới hạn số tin nhắn của backend
const POLL_MS = 30000

export default function Support() {
  const [khuVuc, setKhuVuc] = useState('')
  const [st, setSt] = useState(null)
  const [loi, setLoi] = useState('')
  const [dangLuu, setDangLuu] = useState(false)
  const [tin, setTin] = useState([]) // { role, content, error? }
  const [nhap, setNhap] = useState('')
  const [dangHoi, setDangHoi] = useState(false)
  const cuoi = useRef(null)

  const tai = useCallback(async (kv) => {
    try {
      const s = await getSupportStatus(kv)
      setSt(s)
      setLoi('')
      setKhuVuc((cu) => cu || s.khuVuc || '')
    } catch (e) {
      setLoi(e.message)
    }
  }, [])

  useEffect(() => {
    tai('')
  }, [tai])

  // Tự cập nhật định kỳ để khi có cán bộ vào ca trực thì giao diện chuyển từ AI sang liên hệ người trực
  useEffect(() => {
    if (!khuVuc) return undefined
    const t = setInterval(() => { if (!document.hidden) tai(khuVuc) }, POLL_MS)
    return () => clearInterval(t)
  }, [khuVuc, tai])

  useEffect(() => { cuoi.current?.scrollIntoView({ block: 'end' }) }, [tin, dangHoi])

  const doiKhuVuc = (kv) => {
    setKhuVuc(kv)
    setTin([])
    setSt(null)
    if (kv) tai(kv)
  }

  const batTat = async () => {
    setDangLuu(true)
    try {
      setSt(await setDuty(khuVuc, !st.toiDangTruc))
      setLoi('')
    } catch (e) {
      setLoi(e.message)
    }
    setDangLuu(false)
  }

  const gui = async (noiDung) => {
    const text = noiDung.trim()
    if (!text || dangHoi) return
    const hoi = [...tin.filter((m) => !m.error), { role: 'user', content: text }]
    setTin([...tin, { role: 'user', content: text }])
    setNhap('')
    setDangHoi(true)
    try {
      const { reply } = await askAssistant(khuVuc, hoi.slice(-TOI_DA_NGU_CANH).map(({ role, content }) => ({ role, content })))
      setTin((t) => [...t, { role: 'assistant', content: reply }])
    } catch (e) {
      setTin((t) => [...t, { role: 'assistant', content: e.message, error: true }])
      tai(khuVuc) // có thể vừa có người vào ca trực nên bị từ chối: tải lại trạng thái
    }
    setDangHoi(false)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    gui(nhap)
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gui(nhap) }
  }

  const choAI = khuVuc && st && !st.coNguoiTruc
  const dsTruc = st?.nguoiTruc ?? []

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Trung tâm hỗ trợ</h1>
          <p>Hỗ trợ nghiệp vụ và xử lý sự cố. Khu vực không có cán bộ trực thì trợ lý AI sẽ hỗ trợ.</p>
        </div>
      </div>

      {loi && <div className="field-error" role="alert">{loi}</div>}

      <div className="support-grid">
        <section className="card support-side" aria-label="Ca trực">
          <div className="card-head"><h3>Ca trực của tôi</h3></div>
          <div className="field-group">
            <label className="field-label" htmlFor="khu-vuc">Khu vực</label>
            <select id="khu-vuc" className="field-select" value={khuVuc} onChange={(e) => doiKhuVuc(e.target.value)}>
              <option value="">Chọn khu vực...</option>
              {KHU_VUC.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
          <button type="button" className={`btn btn-block ${st?.toiDangTruc ? 'btn-secondary' : 'btn-primary'}`}
            disabled={!khuVuc || !st || dangLuu} onClick={batTat}>
            <IconUserCheck width={17} height={17} />
            {st?.toiDangTruc ? 'Kết thúc ca trực' : 'Bắt đầu ca trực'}
          </button>
          <small className="field-hint">
            {st?.toiDangTruc
              ? `Bạn đang trực, ca tự kết thúc sau ${st.hetHanSauGio} giờ nếu quên tắt. Cán bộ khác cùng khu vực sẽ thấy bạn để liên hệ.`
              : 'Bật khi bạn sẵn sàng hỗ trợ đồng nghiệp trong khu vực. Khi không còn ai trực, trợ lý AI sẽ trả lời thay.'}
          </small>
          <hr className="support-sep" />
          <p className="support-contact">
            Cần gấp? Đường dây nóng <strong>{HOTLINE.value}</strong><br />
            Kỹ thuật: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
          </p>
        </section>

        <section className="card support-main" aria-label="Hỗ trợ">
          {!khuVuc && <div className="empty-state">Chọn khu vực của bạn để xem ai đang trực hỗ trợ.<small>Chưa chọn thì trợ lý chưa biết bạn thuộc khu vực nào.</small></div>}
          {khuVuc && !st && !loi && <LoadingBlock rows={3} />}

          {khuVuc && st && st.coNguoiTruc && (
            <>
              <div className="field-success" role="status">
                Có {dsTruc.length} cán bộ đang trực khu vực {st.tenKhuVuc}. Hãy liên hệ trực tiếp để được hỗ trợ.
              </div>
              <ul className="support-duty-list">
                {dsTruc.map((c) => (
                  <li key={c.email}>
                    <strong>{c.hoTen}</strong>
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </li>
                ))}
              </ul>
            </>
          )}

          {choAI && (
            <>
              <div className="field-warn" role="status">
                Hiện không có cán bộ nào đang trực khu vực {st.tenKhuVuc}. Trợ lý AI hỗ trợ bạn trong lúc chờ.
              </div>
              {!st.aiSanSang ? (
                <div className="empty-state">
                  Trợ lý AI chưa được bật trên máy chủ.
                  <small>Quản trị viên cần đặt biến GEMINI_API_KEY. Trong lúc đó hãy gọi {HOTLINE.value} hoặc gửi email {SUPPORT_EMAIL}.</small>
                </div>
              ) : (
                <div className="chat">
                  <div className="chat-log" role="log" aria-live="polite" aria-label="Cuộc trò chuyện với trợ lý AI">
                    {tin.length === 0 && (
                      <div className="chat-empty">
                        <IconHelp width={26} height={26} />
                        <p>Xin chào, tôi là trợ lý AI. Bạn cần hỗ trợ gì?</p>
                        <div className="chat-chips">
                          {GOI_Y.map((g) => <button key={g} type="button" className="chip" onClick={() => gui(g)}>{g}</button>)}
                        </div>
                      </div>
                    )}
                    {tin.map((m, i) => (
                      <div key={i} className={`chat-msg ${m.role === 'user' ? 'me' : 'bot'}${m.error ? ' err' : ''}`}>
                        <span className="chat-who">{m.role === 'user' ? 'Bạn' : 'Trợ lý AI'}</span>
                        {/* Hiển thị dạng văn bản thuần (không render HTML) để nội dung AI không thể chèn mã vào trang */}
                        <p>{m.content}</p>
                      </div>
                    ))}
                    {dangHoi && <div className="chat-msg bot"><span className="chat-who">Trợ lý AI</span><p className="chat-typing">Đang soạn câu trả lời...</p></div>}
                    <div ref={cuoi} />
                  </div>
                  <form className="chat-form" onSubmit={onSubmit}>
                    <textarea className="field-textarea" rows={2} maxLength={1000} value={nhap} onChange={(e) => setNhap(e.target.value)}
                      onKeyDown={onKeyDown} placeholder="Nhập câu hỏi (Enter để gửi, Shift+Enter xuống dòng)" aria-label="Câu hỏi cho trợ lý AI" />
                    <button type="submit" className="btn btn-primary" disabled={dangHoi || !nhap.trim()}>Gửi</button>
                  </form>
                  <small className="field-hint">
                    Trợ lý AI chỉ hướng dẫn sử dụng hệ thống và không xem được dữ liệu hồ sơ. Không nhập mật khẩu, mã OTP hay số giấy tờ cá nhân. Không dùng câu trả lời thay quyết định nghiệp vụ.
                  </small>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  )
}
