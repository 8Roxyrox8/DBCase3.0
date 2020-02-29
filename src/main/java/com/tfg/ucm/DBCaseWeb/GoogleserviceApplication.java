package com.tfg.ucm.DBCaseWeb;

import java.security.Principal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.RedirectView;

import controlador.Controlador;

@SpringBootApplication
@RestController
public class GoogleserviceApplication {
	
   public static void main(String[] args) {
      SpringApplication.run(GoogleserviceApplication.class, args);
   }
   @RequestMapping(value = "/user")
   public Principal user(Principal principal) {
      return principal;
   }
   
   @RequestMapping(value = "/")
   public ModelAndView login(Model model, Principal principal) {
	   ModelAndView mav = new ModelAndView();
	   if(principal != null) {   
		   mav.setViewName("inicio");
		   model.addAttribute("perfil", principal);
			Controlador as = new Controlador(1);
			model.addAttribute("prueba", as.pepe());
	   }
		else
		   mav.setViewName("index");
		return mav;
   }
   
   @RequestMapping(value="/inicio", method=RequestMethod.GET)
	public ModelAndView inicio(Model model, Principal principal) {
		ModelAndView mav = new ModelAndView();
		mav.setViewName("inicio");
		model.addAttribute("perfil", principal);
		Controlador as = new Controlador(1);
		model.addAttribute("prueba", as.pepe());
		
		return mav;
	}
   
   @GetMapping("/logout-success")
   public RedirectView redirectWithUsingRedirectView(RedirectAttributes attributes) {
       return new RedirectView("/");
   }
}