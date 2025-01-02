import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import AppMenu from './AppMenu'
import * as authentication from '../authentication'

// モックの作成
jest.mock('../authentication', () => ({
  signOut: jest.fn(),
}))

// window.open のモック
const mockOpen = jest.fn()
window.open = mockOpen

// useNavigate のモック
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

describe('AppMenu', () => {
  const fileId = 'test-file-id'

  // テスト前の共通セットアップ
  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={[`/app/${fileId}`]}>
        <Routes>
          <Route path="/app/:fileId" element={<AppMenu />} />
        </Routes>
      </MemoryRouter>
    )
  })

  // テスト後のクリーンアップ
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders all menu items', () => {
    expect(screen.getByText('物品一覧')).toBeInTheDocument()
    expect(screen.getByText('保管場所一覧')).toBeInTheDocument()
    expect(screen.getByText('コード印刷')).toBeInTheDocument()
    expect(screen.getByText('スプレッドシート変更')).toBeInTheDocument()
    expect(screen.getByText('スプレッドシートを開く')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('navigates to belongings page when clicking 物品一覧', () => {
    fireEvent.click(screen.getByText('物品一覧'))
    expect(mockNavigate).toHaveBeenCalledWith(`/app/${fileId}/belongings`)
  })

  it('navigates to storages page when clicking 保管場所一覧', () => {
    fireEvent.click(screen.getByText('保管場所一覧'))
    expect(mockNavigate).toHaveBeenCalledWith(`/app/${fileId}/storages`)
  })

  it('navigates to print page when clicking コード印刷', () => {
    fireEvent.click(screen.getByText('コード印刷'))
    expect(mockNavigate).toHaveBeenCalledWith(`/app/${fileId}/print`)
  })

  it('opens spreadsheet in new window when clicking スプレッドシートを開く', () => {
    fireEvent.click(screen.getByText('スプレッドシートを開く'))
    expect(mockOpen).toHaveBeenCalledWith(
      `https://docs.google.com/spreadsheets/d/${fileId}/edit`
    )
  })

  it('signs out and redirects when clicking ログアウト', () => {
    // locationのモックを作成
    const originalLocation = window.location
    delete window.location
    window.location = { href: '' } as Location

    fireEvent.click(screen.getByText('ログアウト'))

    expect(authentication.signOut).toHaveBeenCalled()
    expect(window.location.href).toBe('/')

    // locationのモックを元に戻す
    window.location = originalLocation
  })

  it('redirects to root when clicking スプレッドシート変更', () => {
    // locationのモックを作成
    const originalLocation = window.location
    delete window.location
    window.location = { href: '' } as Location

    fireEvent.click(screen.getByText('スプレッドシート変更'))
    expect(window.location.href).toBe('/')

    // locationのモックを元に戻す
    window.location = originalLocation
  })
})
