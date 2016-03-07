class PagesController < ApplicationController

	#layout "main"

	def index
	end

	def function
		render :layout => "grapher"
	end

	def parametric
		render :layout => "grapher"
	end


end
