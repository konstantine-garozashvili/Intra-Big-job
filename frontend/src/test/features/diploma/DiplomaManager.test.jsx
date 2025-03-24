import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiplomaManager from '../../../pages/Global/Profile/components/settings/DiplomaManager'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { diplomaService } from '../../../pages/Global/Profile/services/diplomaService'
import { toast } from 'sonner'

// Mock the toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock the diploma service
vi.mock('../../../pages/Global/Profile/services/diplomaService', () => ({
  diplomaService: {
    getUserDiplomas: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Bachelor in Computer Science', institution: 'Tech University', obtainedDate: '2023-06-15' }
    ])),
    getAvailableDiplomas: vi.fn(() => Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Bachelor in Computer Science', institution: 'Tech University' },
        { id: 2, name: 'Master in Software Engineering', institution: 'Code Academy' }
      ]
    })),
    addUserDiploma: vi.fn(() => Promise.resolve({ success: true, message: 'Diplôme ajouté avec succès' })),
    deleteUserDiploma: vi.fn(() => Promise.resolve({ success: true, message: 'Diplôme supprimé avec succès' }))
  }
}))

// Create a wrapper with React Query provider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('DiplomaManager', () => {
  const mockProps = {
    userData: { role: 'ROLE_STUDENT' },
    diplomas: [
      { 
        id: 1, 
        diploma: {
          id: 1,
          name: 'Bachelor in Computer Science',
          institution: 'Tech University'
        },
        obtainedDate: '2023-06-15'
      }
    ],
    setDiplomas: vi.fn()
  }

  it('renders the diploma manager component', async () => {
    render(<DiplomaManager {...mockProps} />, { wrapper: createWrapper() })
    
    // Check if the main elements are rendered
    expect(await screen.findByText('Gestion des diplômes')).toBeInTheDocument()
    expect(await screen.findByText('Ajouter un diplôme')).toBeInTheDocument()
  })

  it('displays user diplomas', async () => {
    render(<DiplomaManager {...mockProps} />, { wrapper: createWrapper() })
    
    // Wait for diplomas to load
    await waitFor(() => {
      expect(screen.getByText('Bachelor in Computer Science')).toBeInTheDocument()
    })
  })

  it('opens add diploma form when clicking add button', async () => {
    render(<DiplomaManager {...mockProps} />, { wrapper: createWrapper() })
    
    // Click the add button
    const addButton = await screen.findByText('Ajouter un diplôme')
    await userEvent.click(addButton)
    
    // Check if the form is opened
    expect(screen.getByText('Ajouter un diplôme')).toBeInTheDocument()
    expect(screen.getByText('Diplôme')).toBeInTheDocument()
    expect(screen.getByText("Date d'obtention")).toBeInTheDocument()
  })

  it('allows adding a new diploma', async () => {
    render(<DiplomaManager {...mockProps} />, { wrapper: createWrapper() })
    
    // Open add form
    const addButton = await screen.findByText('Ajouter un diplôme')
    await userEvent.click(addButton)
    
    // Fill the form
    const dateInput = screen.getByLabelText("Date d'obtention")
    await userEvent.type(dateInput, '2024-03-15')
    
    // Submit the form
    const submitButton = screen.getByText('Enregistrer')
    await userEvent.click(submitButton)
    
    // Check if error message appears
    await waitFor(() => {
      expect(screen.getByText('Veuillez sélectionner un diplôme')).toBeInTheDocument()
    })
  })

  it('allows deleting a diploma', async () => {
    global.confirm = vi.fn(() => true) // Mock confirm dialog
    
    // Mock roleUtils to allow editing
    vi.mock('../../utils/roleUtils', () => ({
      canEditAcademic: () => true,
      isAdmin: () => false,
      isStudent: () => true
    }))

    render(<DiplomaManager {...mockProps} />, { wrapper: createWrapper() })
    
    // Wait for loading to finish and diplomas to be displayed
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByText('Bachelor in Computer Science')).toBeInTheDocument()
    })
    
    // Find and click the delete button
    const deleteButton = screen.getByTestId('delete-diploma-button')
    await userEvent.click(deleteButton)
    
    // Check if success message was shown via toast
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Diplôme supprimé avec succès')
    })
  })
}) 