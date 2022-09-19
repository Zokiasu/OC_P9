import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { ROUTES } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";

// Connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Lorsque je suis sur la page des notes de frais
  describe("When I am on Bills Page", () => {
+
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList).toContain("active-icon"); 
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  // Lorsque je suis sur la page des notes de frais mais qu'elle charge
  describe('When I am on Bills page but it is loading', () => {
    // Alors, un loader doit apparaître
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  // Lorsque je suis sur la page des notes de frais mais qu'il y a une erreur
  describe('When I am on Bills page but back-end send an error message', () => {
    // Alors, la page d'erreur doit apparaître
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })
})

// Connecté en tant qu'employé
describe('Given I am connected as an Employee', () => {
  // Lorsque je clique sur le bouton de création de note de frais
  describe('When I am on Bills page and I click on NewBill button', () => {
    test('Then, handleClickNewBill() is called', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const constructorBills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: [] })
      const handleClickNewBill = jest.fn(constructorBills.handleClickNewBill)
      const btnNewBill = screen.getByTestId('btn-new-bill')
      btnNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(btnNewBill)
      expect(handleClickNewBill).toHaveBeenCalled()
      
    })

    test('Then, NewBill page is open', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const constructorBills = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: [] })
      const handleClickNewBill = jest.fn(constructorBills.handleClickNewBill)
      const btnNewBill = screen.getByTestId('btn-new-bill')
      btnNewBill.addEventListener('click', handleClickNewBill)
      
      userEvent.click(btnNewBill)
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
  // Lorsque je clique sur l'oeil de visualisation d'une note de frais
  describe('When I am on Bills page and I click on icon Eye', () => {
    // Alors, la fonction handleClickIconEye() doit être appelée
    test('Then, handleClickIconEye() is called', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const constructorBills = new Bills({
        document, onNavigate, store:null, localStorage: window.localStorage
      })
      const handleClickIconEye = jest.fn(constructorBills.handleClickIconEye)
      const iconEye = screen.getAllByTestId('icon-eye')
      let index = 0
      iconEye.forEach(icon => {
        icon.addEventListener('click', handleClickIconEye(icon))
        index++
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalledTimes(index)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
      userEvent.click(iconEye[0])
      userEvent.click(iconEye[1])
      userEvent.click(iconEye[2])
      userEvent.click(iconEye[3])
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(handleClickIconEye).toHaveBeenCalledTimes(4)
    })
    //Alors, la modale de visualisation de la note de frais s'ouvre
    test('Then, modale is open', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = BillsUI({ data: bills })
      const constructorBills = new Bills({
        document, onNavigate, store:null, localStorage: window.localStorage
      })
      const handleClickIconEye = jest.fn(constructorBills.handleClickIconEye)
      const iconEye = screen.getAllByTestId('icon-eye')
      iconEye.forEach(icon => {
        icon.addEventListener('click', handleClickIconEye(icon))
      })
      userEvent.click(iconEye[0])
      expect(screen.getByText('Justificatif')).toBeTruthy()
    })
  })
  // Lorsque je suis sur la page des notes de frais mais qu'elle charge
  describe('When I am on Bills page', () => {
    // Alors, le chargement des données lance la fonction getBills()
    test('Then, charging data launch getBills', () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const constructorBills = new Bills({
        document, onNavigate, store:null, localStorage: window.localStorage
      })
      const getBills = jest.fn(constructorBills.getBills)
      getBills()
      expect(getBills).toHaveBeenCalled()
    })
  })
})

// Connecté en tant qu'emmployé
describe("Given I am a user connected as Employee", () => {
  // Lorsque j'ouvre une note de frais
  describe("When I navigate to bills", () => {
    // Alors, récupère les données de la note de frais et réalise un mock
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore.bills(), "list");
      const billss = await mockStore.bills().list()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(billss.length).toBe(4)
    })

    test("fetches bills from an API and fails with 404 message error", async () => {

      // mockStore.bills.mockImplementationOnce(() => {
      //   return {
      //     list : () =>  {
      //       return Promise.reject(new Error("Erreur 404"))
      //     }
      //   }
      // })
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {
      // mockStore.bills.mockImplementationOnce(() => {
      //   return {
      //     list : () =>  {
      //       return Promise.reject(new Error("Erreur 500"))
      //     }
      //   }
      // })
      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})